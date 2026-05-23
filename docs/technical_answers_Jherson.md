# Respuestas Técnicas — Sección 5

## Pregunta 1 — Granularidad de `fact_listening_history`

La granularidad de `fact_listening_history` es una reproducción individual: cada fila representa que un usuario escuchó una canción en un instante exacto. El problema con usar `played_at` como clave primaria sola es que dos usuarios distintos pueden estar escuchando música al mismo tiempo, lo cual generaría colisiones entre filas que en realidad son válidas. Para resolverlo, el modelo usa una clave primaria sintética (`id SERIAL`) que identifica técnicamente cada fila, y le suma la restricción `UNIQUE(user_id, played_at)` como clave de negocio. Esa combinación respeta el grain real de la tabla y además habilita la idempotencia del ETL, evitando duplicados al correrlo varias veces.

---

## Pregunta 2 — Las cláusulas `ON CONFLICT ... DO NOTHING`

Las cláusulas `ON CONFLICT ... DO NOTHING` garantizan la idempotencia del ETL, lo que significa que correrlo una o muchas veces siempre produce el mismo resultado sin duplicar datos. En las dimensiones usa `ON CONFLICT (spotify_id)` porque ese es el identificador único natural de Spotify, y en la tabla de hechos usa `ON CONFLICT (user_id, played_at)` porque un usuario no puede escuchar dos canciones al mismo tiempo. Si no existiera esa cláusula y se corriera el ETL dos veces el mismo día, la segunda ejecución volvería a insertar las mismas reproducciones, inflando artificialmente todos los conteos y arruinando los análisis. En el peor caso, si existe la restricción `UNIQUE` pero no el `ON CONFLICT`, el ETL simplemente abortaría con un error de violación de constraint en la primera fila duplicada.

---

## Pregunta 3 — La FK de `dim_tracks` hacia `dim_artists`

La FK de `dim_tracks` hacia `dim_artists` convierte el modelo en un híbrido snowflake, porque en un star schema puro las dimensiones nunca se relacionan entre sí sino únicamente con la tabla de hechos. La alternativa pura sería copiar el nombre del artista directamente dentro de `dim_tracks`, evitando la referencia, pero eso implicaría repetir información y complicar las actualizaciones. Se decidió mantener la FK porque evita duplicar datos, simplifica el ETL y garantiza que no existan tracks apuntando a artistas inexistentes. El trade-off es que las queries analíticas necesitan un JOIN extra entre `fact_listening_history → dim_tracks → dim_artists`, lo que añade complejidad al SQL. En un DWH industrial eso podría ser un problema de rendimiento, pero en este proyecto con volúmenes pequeños la normalización vale la pena.

---

## Pregunta 4 — Flujo OAuth PKCE hasta JWT en `localStorage`

Cuando el usuario hace clic en "Conectar con Spotify", el frontend llama al backend, que genera un par PKCE (`code_verifier` + `code_challenge`) y un `state` aleatorio, los guarda temporalmente, y redirige al usuario a Spotify para que autorice. Una vez el usuario aprueba, Spotify devuelve un `code` al callback del backend, que lo intercambia por tokens enviando el `code_verifier` original para que Spotify verifique que es el mismo cliente legítimo. Con el `access_token` obtenido, el backend consulta el perfil del usuario, hace UPSERT en `dim_users`, emite un JWT propio firmado con `SECRET_KEY` y lo manda al frontend vía redirect. El frontend lo recibe en la URL, lo guarda en `localStorage` y limpia el historial del navegador para no dejarlo expuesto.

**¿Qué es PKCE?** Es una extensión de OAuth que reemplaza el `client_secret` fijo por un secreto dinámico generado en cada login: solo se envía el hash por la red, nunca el valor real, así que aunque un atacante intercepte el `authorization_code`, no puede usarlo sin el `code_verifier` que solo el backend conoce.

---

## Pregunta 5 — `cursor_next_ms` en `etl_audit`

`cursor_next_ms` es un marcador que guarda el timestamp de la última reproducción cargada exitosamente, permitiendo que cada ejecución del ETL pida a Spotify solo lo nuevo con el parámetro `after=<cursor>` en lugar de traer siempre las mismas 50 canciones. Esto es crítico porque `recently-played` no es un historial completo sino una ventana deslizante: cada canción nueva que entra empuja a la más vieja fuera de esa ventana para siempre. Si se escuchan 80 canciones sin correr el ETL, las 30 más antiguas desaparecen de la API de Spotify y nunca podrán recuperarse para el DWH. La mitigación es simple: correr el ETL varias veces al día en días de alta actividad usando el botón "Sincronizar" del frontend, que vacía la ventana hacia el DWH antes de que se desborde.