# tonesear/tone-sear

## Resumen

Tone Sear es una aplicación de análisis de audio distribuida a través de HuggingFace, no un modelo de lenguaje. Recibe una canción, aísla la pista de guitarra, localiza las secciones en las que suena, las agrupa por similitud de tono, graba un extracto de cada grupo, mide las propiedades de ese tono y escribe una receta de preset para el pedal multiefectos NUX MG-300 MKII por cada tono distinto. La publica el usuario tonesear bajo el identificador tonesear/tone-sear, con licencia sin especificar y sin idiomas declarados.

El único componente de aprendizaje automático es Demucs, el modelo de separación de fuentes de Meta, cuyos pesos (unos 250 MB) se descargan en el primer análisis en lugar de incluirse en la imagen. Todo el procesamiento se ejecuta en la máquina del usuario: la documentación insiste en que ningún audio se sube a ningún servicio, lo que resulta apropiado para material con derechos de autor o grabaciones privadas.

Su relevancia es acotada y muy concreta: resuelve el problema de replicar un tono de guitarra en un procesador físico sin depender de la nube, y lo hace con un coste de cómputo bajo, ya que el análisis es CPU-bound y no requiere GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo de lenguaje. Pipeline de análisis de audio (separación de fuentes con Demucs sobre PyTorch, agrupación y caracterización de tonos) empaquetado como aplicación web con autenticación y base de datos |
| Parámetros totales | No disponible (los pesos de Demucs ocupan aproximadamente 250 MB) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no es un modelo de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la model card está redactada en inglés) |
| Licencia | No disponible (no se declara ni en el repositorio ni en la model card) |
| Formato de pesos | PyTorch (pesos de Demucs, descargados en el primer análisis y cacheados en el volumen model-cache) |

Datos adicionales del repositorio: identificador tonesear/tone-sear, autor tonesear, etiqueta region:us, 0 descargas, 1 like, tamaño del repositorio 0,0 GB, creado y actualizado el 2026-09-12, pipeline no disponible. El frontmatter de la model card declara sdk: docker y app_port: 7860, mientras que el texto del README indica el puerto 8000 por defecto (configurable mediante la variable PORT).

## Arquitectura y entrenamiento

El proyecto no entrena ningún modelo propio. Reutiliza Demucs para separar la mezcla en fuentes y trabaja sobre la pista de guitarra resultante. A partir de ahí, la documentación describe cinco etapas: detección de las secciones con guitarra activa, agrupación de esas secciones por tono, grabación de un extracto por grupo, medición de las propiedades acústicas del tono y traducción de esas medidas a una receta de preset para el NUX MG-300 MKII. La model card no detalla el algoritmo de agrupación, las características acústicas medidas, el número de extractos ni el procedimiento de calibración entre medidas y parámetros del pedal.

La aportación técnica está en el empaquetado y en el despliegue: dos contenedores (aplicación y Postgres) con tres volúmenes persistentes (db-data para cuentas y registros de trabajos, job-data para subidas, stems, clips e informes, y model-cache para los pesos de Demucs), instalación de PyTorch desde el índice de ruedas solo para CPU para reducir la imagen de más de 6 GB a unos 2 GB, y una degradación explícita cuando se omite Demucs: en ese caso el análisis se realiza directamente sobre la mezcla y el sistema rebaja sus propias puntuaciones de confianza, advirtiéndolo al usuario. No se documenta ningún proceso de ajuste fino, RLHF o DPO.

## Capacidades

- Separación de la pista de guitarra de una canción completa mediante Demucs.
- Localización de los tramos en los que la guitarra está sonando.
- Agrupación de esos tramos por similitud de tono.
- Grabación de un extracto de audio por cada grupo de tono detectado.
- Medición de las características del tono (la model card no especifica qué magnitudes ni con qué método).
- Generación de una receta de preset para el NUX MG-300 MKII por cada tono distinto.
- Procesamiento íntegramente local, sin subida de audio a servicios externos.
- Gestión de cuentas con Google OAuth o correo y contraseña, con vinculación automática de identidades cuando el correo coincide.
- Historial de análisis por cuenta, con reapertura y borrado de trabajos anteriores, y aislamiento por propietario (un trabajo ajeno devuelve 404).
- Modo alternativo sin Demucs que analiza la mezcla completa con confianza declarada más baja.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes, porque no es un modelo de lenguaje.

## Casos de uso

- Replicación de tonos en el NUX MG-300 MKII: el usuario introduce una canción de referencia y obtiene una receta de preset por cada tono distinto, lo que evita el ajuste manual por prueba y error de los parámetros del pedal.
- Estudio de guitarra y transcripción: al aislar la pista de guitarra y marcar las secciones activas, el extracto resultante sirve como material de escucha aislada para aprender un solo o un riff concreto.
- Producción en home studio: permite comparar el tono de una grabación propia con el de una referencia comercial antes de fijar la cadena de efectos, usando los extractos y las medidas como diagnóstico.
- Bandas de versiones y tributo: cada miembro puede obtener presets consistentes para las canciones del repertorio, reduciendo el tiempo de configuración en ensayos y directos.
- Docencia musical: el profesor puede generar extractos aislados de guitarra y asociarlos a descripciones medibles del tono, en lugar de depender únicamente de descripciones subjetivas.
- Archivado de presets de un guitarrista: analizar una discografía completa en local para construir una biblioteca de recetas organizadas por canción y por tono, sin exponer el material a terceros.
- Trabajo con material sensible o no publicable: como el procesamiento es local y no sale audio del equipo, encaja en entornos donde no se permite subir pistas a servicios externos.
- Despliegue autoalojado multiusuario: con Postgres, cuentas y aislamiento por propietario, un estudio o un aula puede ofrecer la herramienta en su propia red, cerrando el registro con ALLOW_REGISTRATION=0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión de la separación, de la agrupación por tono, del error de estimación de parámetros ni de fidelidad de los presets generados, ni comparaciones con otras herramientas. Tampoco se documentan tiempos de análisis por canción ni consumo de memoria.

## Requisitos de hardware

- VRAM: no requerida. El análisis es CPU-bound y PyTorch se instala desde el índice de ruedas solo para CPU.
- GPU: no aplicable; no se documenta ningún uso de GPU.
- CPU y RAM: no se especifican modelos ni cantidad de memoria (no disponible).
- Disco: imagen Docker de aproximadamente 2 GB (frente a más de 6 GB si se instalase PyTorch con soporte CUDA); instalación en venv con PyTorch de aproximadamente 2 GB; pesos de Demucs de unos 250 MB descargados en el primer análisis.
- Software: Python 3.10 o superior y ffmpeg en el PATH (el script run.sh selecciona el intérprete más reciente que cumpla el requisito); Docker y Docker Compose para el despliegue recomendado.
- Base de datos: Postgres en el despliegue con Docker Compose, o SQLite en data/ si no se define DATABASE_URL.
- Puertos y red: 8000 por defecto (variable PORT), con app_port 7860 declarado en el frontmatter de la model card.
- Latencia y throughput: no disponibles.
- Opciones de despliegue: docker compose up -d --build (contenedores de aplicación y Postgres) o ejecución directa con ./run.sh.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras herramientas de separación de fuentes, de análisis de tono ni de generación de presets, y la búsqueda web realizada no devolvió resultados relevantes sobre el proyecto. No se dispone de datos de parámetros, contexto, rendimiento o licencia de alternativas que permitan una comparación fundamentada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código y no soporta tool calling ni agentes.
- Licencia no declarada: no se especifica si se permite el uso comercial, la modificación o la redistribución, lo que impide un uso en producción con garantías jurídicas.
- El repositorio de HuggingFace ocupa 0,0 GB y la model card menciona archivos que no aparecen en la información disponible (run.sh, .env.example, docker-compose, docs/images/home.png), por lo que no se puede verificar que el proyecto sea desplegable tal cual desde ese repositorio. El propio README aparece truncado.
- Dependencia crítica de Demucs: la calidad de la separación condiciona todo el análisis posterior; artefactos de separación, mezclas densas o guitarras con efectos de modulación pueden degradar la estimación del tono.
- El modo sin Demucs analiza la mezcla completa y el propio sistema rebaja sus puntuaciones de confianza, por lo que sus resultados deben tratarse como orientativos.
- Salida limitada al NUX MG-300 MKII: no se documenta exportación a otros formatos de preset ni a otros procesadores.
- Riesgo de agrupación incorrecta: dos secciones con tonos distintos pueden caer en el mismo grupo, o un mismo tono puede dividirse en varios; no hay métricas publicadas que cuantifiquen este error.
- Sesgos no documentados: no se describe la composición de las canciones ni de los géneros usados para calibrar la correspondencia entre medidas y parámetros del pedal, por lo que el comportamiento fuera de ese dominio es incierto.
- Seguridad en despliegue: el registro está abierto por defecto (ALLOW_REGISTRATION=1) y COOKIE_SECURE vale 0; exponerlo en internet exige TLS, COOKIE_SECURE=1 y, preferiblemente, cerrar el registro, dado que el análisis con Demucs es costoso y cualquier usuario registrado puede lanzarlo.
- La autenticación con Google tiene modos de fallo documentados (invalid_client por identificador o secreto incorrectos, redirect_uri_mismatch, access_denied en clientes en modo Testing) y las credenciales se leen solo al arrancar el proceso.
- SESSION_SECRET es obligatorio en Compose; cambiarlo invalida todas las sesiones activas.
- Adopción nula verificable: 0 descargas y 1 like en el repositorio, por lo que no hay evidencia de uso en producción ni de validación externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tonesear/tone-sear
- No se han encontrado papers, blogs, repositorios de código ni demos enlazados en la información disponible.
- La búsqueda web realizada no devolvió resultados relevantes: únicamente páginas de ayuda de YouTube en japonés, ruso y chino sin relación con el proyecto.
- La model card referencia una imagen interna (docs/images/home.png) que no es accesible desde los datos proporcionados.
