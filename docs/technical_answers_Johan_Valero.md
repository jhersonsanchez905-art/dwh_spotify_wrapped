# Sección 5 — Respuestas Técnicas

---

## Pregunta 1

**¿Cuál es la granularidad de `fact_listening_history`? ¿Qué representa exactamente una fila? ¿Por qué `played_at` no puede ser clave primaria por sí sola y cómo se resolvió eso en el modelo?**

La granularidad de `fact_listening_history` es **una reproducción de una canción por un usuario en un momento específico**. Es decir, cada fila representa el evento de que un usuario determinado escuchó una canción en especifica en un instante.

`played_at` no puede ser clave primaria por sí sola porque un mismo timestamp puede repetirse: si dos usuarios diferentes escuchan canciones exactamente al mismo tiempo, ambos eventos tendrían el mismo `played_at`, lo que generaría una colisión. Incluso el mismo usuario podría, en teoría, tener registros con timestamps muy cercanos o duplicados por problemas de sincronización con la API de Spotify.

Para resolver esto, la clave primaria compuesta se define como **(user_id, played_at)**, lo cual garantiza unicidad a nivel de "este usuario, en este momento exacto". Esto refleja la realidad del negocio: un usuario no puede estar escuchando dos canciones al mismo tiempo, por lo que esa combinación es suficiente para identificar un evento de forma única.

---

## Pregunta 2

**El ETL usa `ON CONFLICT (spotify_id) DO NOTHING` en las dimensiones y `ON CONFLICT (user_id, played_at) DO NOTHING` en la tabla de hechos. ¿Qué propiedad garantiza eso? ¿Qué pasaría si no existiera esa cláusula y corrieran el ETL dos veces el mismo día?**

Estas cláusulas garantizan la **idempotencia** del proceso ETL. Idempotencia significa que ejecutar el mismo proceso múltiples veces produce el mismo resultado que ejecutarlo una sola vez, sin duplicar ni corromper datos.

En las dimensiones, `ON CONFLICT (spotify_id) DO NOTHING` asegura que si un artista o canción ya existe en la tabla, el insert simplemente se ignora en lugar de fallar o duplicar el registro. Lo mismo aplica para la tabla de hechos con la combinación `(user_id, played_at)`.

Si no existiera esta cláusula y se corriera el ETL dos veces el mismo día, ocurriría lo siguiente:
- En las **dimensiones**: se intentaría insertar el mismo `spotify_id` dos veces, lo que lanzaría un error de violación de constraint unique y detendría el proceso (o, si no hay constraint, simplemente duplicaría los registros).
- En la **tabla de hechos**: se duplicarían todos los eventos de escucha del día, inflando artificialmente las métricas. Por ejemplo, el conteo de canciones reproducidas aparecería el doble de lo real, arruinando cualquier análisis posterior.

En resumen, sin idempotencia el ETL sería frágil y poco confiable en entornos de producción donde los reprocesos son inevitables.

---

## Pregunta 3

**`dim_tracks` tiene una FK hacia `dim_artists`. ¿Qué tipo de schema genera esa relación entre dimensiones? ¿Cuál sería la alternativa en un star schema puro? ¿Por qué se decidió mantener la FK y cuál es el trade-off?**

Cuando una dimensión referencia a otra dimensión a través de una foreign key, el resultado es un **snowflake schema** (esquema de copo de nieve). En este caso, `dim_tracks` apunta a `dim_artists`, lo que crea una jerarquía normalizada entre dimensiones.

En un **star schema puro**, esta relación no existiría como FK. En cambio, los atributos del artista (nombre, género, popularidad, etc.) estarían **desnormalizados directamente dentro de `dim_tracks`**, repitiendo esa información en cada fila de la dimensión de tracks. La tabla de hechos quedaría conectada únicamente a dimensiones "planas", sin relaciones entre ellas.

La decisión de mantener la FK hacia `dim_artists` probablemente responde a razones de **integridad referencial y reducción de redundancia**: si un artista tiene muchas canciones, duplicar sus atributos en cada fila de `dim_tracks` desperdiciaría espacio y haría más difícil actualizar datos del artista (habría que actualizar muchas filas en lugar de una sola).

El **trade-off** es claro: el snowflake schema es más normalizado y eficiente en almacenamiento, pero introduce joins adicionales en las consultas analíticas, lo que puede impactar el rendimiento. El star schema desnormalizado es más rápido para consultas de BI porque reduce los joins, pero a costa de redundancia. En este modelo se priorizó la consistencia de los datos sobre la simplicidad de consulta.

---

## Pregunta 4

**Expliquen el flujo completo desde que el usuario hace clic en "Conectar con Spotify" hasta que el frontend tiene el JWT en `localStorage`. ¿Qué es PKCE y por qué se usa?**

El flujo completo es el siguiente:

1. **El usuario hace clic en "Conectar con Spotify"**: el frontend genera un `code_verifier` (una cadena aleatoria segura) y a partir de él computa el `code_challenge` aplicando SHA-256 y luego Base64url. Guarda el `code_verifier` temporalmente (en memoria o sessionStorage).

2. **Redirección a Spotify**: el frontend redirige al usuario a la URL de autorización de Spotify, incluyendo en los parámetros el `client_id`, el `redirect_uri`, los `scopes` solicitados, y el `code_challenge` junto con el método (`S256`). Spotify muestra la pantalla de consentimiento al usuario.

3. **Autorización del usuario**: el usuario acepta los permisos. Spotify redirige de vuelta al `redirect_uri` del frontend con un `authorization_code` en los query params de la URL.

4. **Intercambio del código por tokens**: el frontend toma ese `authorization_code` y lo envía al **backend propio** (no directamente a Spotify), junto con el `code_verifier` original. El backend hace la petición a Spotify para intercambiar el código por un `access_token` y un `refresh_token`, verificando que el `code_verifier` corresponda al `code_challenge` enviado inicialmente.

5. **Generación del JWT**: con el `access_token` de Spotify validado, el backend crea un JWT propio, firmado con su clave secreta, que identifica al usuario en el sistema.

6. **JWT al frontend**: el backend devuelve el JWT al frontend, que lo almacena en `localStorage` para usarlo en futuras peticiones autenticadas.

**¿Qué es PKCE?** PKCE (Proof Key for Code Exchange) es una extensión del flujo OAuth 2.0 diseñada para aplicaciones públicas (como SPAs o apps móviles) donde no es seguro guardar un `client_secret`. Funciona así: el cliente genera un secreto temporal (`code_verifier`), computa su hash (`code_challenge`) y lo envía al inicio del flujo. Al intercambiar el código, debe demostrar que tiene el `code_verifier` original. Esto evita que un atacante que intercepte el `authorization_code` pueda usarlo, ya que no conoce el `code_verifier`.

Se usa porque en aplicaciones frontend el `client_secret` estaría expuesto en el código del navegador, lo que sería un riesgo de seguridad grave. PKCE reemplaza esa necesidad de forma segura.

---

## Pregunta 5

**¿Para qué sirve `cursor_next_ms` en `etl_audit`? ¿Qué problema resuelve? ¿Qué pasaría si escuchan 80 canciones en un día sin correr el ETL?**

`cursor_next_ms` es un **marcador de posición temporal** que indica desde qué timestamp (en milisegundos) debe continuar la próxima ejecución del ETL al consultar el historial de reproducción de Spotify.

El problema que resuelve es la **paginación y continuidad incremental** de la ingesta de datos. La API de Spotify para el historial de reproducciones no devuelve todo el historial de una vez; retorna un máximo de 50 ítems por llamada y usa cursores para paginar. Sin guardar el cursor, cada ejecución del ETL no sabría desde dónde retomar y tendría que procesar todo desde el principio (o perder datos intermedios).

Al guardar `cursor_next_ms` en `etl_audit` al final de cada ejecución exitosa, el ETL sabe exactamente cuál fue el último evento procesado y puede pedir a Spotify solo los eventos **posteriores** a ese punto. Esto hace el proceso eficiente e incremental.

**Si se escuchan 80 canciones en un día sin correr el ETL**, ocurre un problema importante: la API de Spotify del endpoint `recently-played` solo retiene los últimos **50 eventos**. Esto significa que los 30 eventos más antiguos de ese día se perderían definitivamente, ya que habrían salido de la ventana de la API antes de ser capturados. El `cursor_next_ms` guardado seguiría apuntando al último evento procesado antes de ese día, pero al consultar la API solo se obtendrían las 50 canciones más recientes, dejando un hueco en los datos históricos que ya no se podría recuperar. Esto ilustra por qué es crítico correr el ETL con frecuencia (idealmente cada pocas horas) para no perder eventos dentro de esa ventana de retención.
