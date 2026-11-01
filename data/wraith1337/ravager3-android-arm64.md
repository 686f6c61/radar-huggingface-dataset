# wraith1337/ravager3-android-arm64

## Resumen

Ravager 3 Android ARM64 es una compilación portada a Android ARM64 del motor de ajedrez Ravager 3, desarrollado originalmente por Abhinav Tiwari y publicado en el repositorio GitHub erensh27/Ravager. No se trata de un modelo de lenguaje ni de una red neuronal generativa: es un motor de ajedrez UCI (Universal Chess Interface) con evaluación basada en una red neuronal NNUE embebida, compilado para dispositivos Android 10 o superiores (API 29) sobre arquitectura ARM64. La build la distribuye el usuario wraith1337 en HuggingFace como port independiente, no como asset oficial del proyecto original.

El binario ocupa 89.932.544 bytes (aproximadamente 85,8 MiB) e incorpora la red NNUE en el propio ejecutable, lo que evita dependencias externas de ficheros de pesos. El repositorio completo pesa 0,2 GB e incluye, además del binario, el código fuente correspondiente completo (`ravager-source-android-arm64-full.tar.gz`), un APK firmado que actúa como proveedor OEX (`Ravager3-Android-arm64-OEX.apk`) y el código fuente del wrapper con licencia Apache 2.0. La licencia del motor es AGPL-3.0.

La relevancia de esta ficha es acotada: no hay información sobre benchmarks de fuerza de juego, no se ha probado en un teléfono físico (solo mediante emulación de usuario ARM64) y no dispone de descargas ni interacciones en el momento de la consulta. Su interés reside en la portabilidad del motor a Android con alineación de segmentos ELF para páginas de 4 KB y 16 KB, un detalle técnico relevante para dispositivos Android 16 en adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de ajedrez UCI con evaluación NNUE (red neuronal embebida); código escalar NNUE, sin optimizaciones NEON escritas a mano |
| Parametros totales | no disponible (el tamaño de la red NNUE no se detalla; el binario completo son 89.932.544 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (motor de ajedrez, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (red NNUE embebida en el binario, sin opciones de cuantización documentadas) |
| Idiomas soportados | no disponible (interfaz UCI, sin procesamiento de lenguaje natural) |
| Licencia | AGPL-3.0 (wrapper OEX bajo Apache 2.0) |
| Formato de pesos | NNUE embebida en el binario ELF; fuente completa en `ravager-source-android-arm64-full.tar.gz` |

## Arquitectura y entrenamiento

Ravager 3 es un motor de ajedrez clásico de búsqueda alfa-beta con evaluación mediante red neuronal NNUE (Efficiently Updatable Neural Network), una arquitectura habitual en motores modernos como Stockfish. La build Android ARM64 parte del commit oficial `a6497e92bfe865a94a92c443c1bc9fbb38a832fb` de la rama main, que coincide con la etiqueta `v3`, y añade un parche de portabilidad. Ese parche incluye guardas de compilación alrededor de los kernels y el dispatch de x86, comparación de casillas portable y alineación thread-local específica de Android. No se modifican la búsqueda ni la red neuronal: se reutiliza el código NNUE escalar existente y se deja que el compilador lo vectorice si puede. No hay optimizaciones NEON escritas a mano.

No se dispone de información sobre el proceso de entrenamiento de la red NNUE (número de posiciones, composición del dataset, técnicas de ajuste) en la documentación proporcionada. La verificación realizada por el autor se hizo mediante emulación de usuario ARM64, no en un teléfono físico: el bench estándar da 440.703 nodos, idéntico al binario oficial x64, y el perft(5) desde la posición inicial es 4.865.609. El handshake UCI y la búsqueda funcionan en emulación; la velocidad real en teléfono y la compatibilidad con interfaces gráficas quedan sin verificar.

## Capacidades

- Juego de ajedrez mediante protocolo UCI: acepta comandos estándar (`uci`, `isready`, `position`, `go`, `stop`, `quit`) y devuelve mejores jugadas y líneas principales.
- Evaluación posicional con red NNUE embebida, sin ficheros de pesos externos.
- Búsqueda alfa-beta con gestión de tabla de transposición configurable (Hash) y multihilo (Threads).
- Ejecución como binario externo en interfaces gráficas Android compatibles, como DroidFish.
- Ejecución como proveedor OEX mediante el APK firmado incluido, seleccionable desde la opción "Add OEX engines" de Chessis.
- Alineación de segmentos ELF preparada para dispositivos con páginas de 4 KB y 16 KB (relevante para Android 16).
- No solicita permisos en el APK wrapper.
- No dispone de capacidades de lenguaje natural, visión, audio, tool calling ni razonamiento multi-paso fuera del ámbito del ajedrez.

## Casos de uso

- Análisis de partidas en Android: el motor puede cargarse en DroidFish como binario externo para analizar posiciones y obtener líneas principales con evaluación NNUE, aprovechando que el binario no requiere ficheros de red adicionales.
- Integración en Chessis mediante OEX: instalando `Ravager3-Android-arm64-OEX.apk` y seleccionándolo desde la opción de añadir motores OEX, se puede usar el motor dentro de esa interfaz sin necesidad de binarios externos.
- Entrenamiento y estudio de aperturas: con Hash 64 MB y Threads 1 como configuración inicial recomendada, el motor sirve para explorar variantes y comparar evaluaciones en dispositivos de gama media.
- Pruebas de portabilidad en CI: el tarball de fuente completa y las notas de compilación con NDK (`BUILD-NOTES.txt`) permiten reproducir la build y verificar el parche de portabilidad en pipelines automatizados.
- Desarrollo de interfaces gráficas propias: al ser un motor UCI estándar, cualquier frontend que lance procesos externos en Android puede integrarlo, siempre que soporte binarios ARM64.
- Verificación de integridad y auditoría de licencia: el SHA-256 publicado (`781fd695988b1d9983b91755f94e238c926d164ce40fddfd620d6039cc46d83e`) y la inclusión del código fuente completo facilitan la auditoría del cumplimiento AGPL-3.0 en distribuciones.
- Evaluación comparativa de rendimiento en emulación: el bench de 440.703 nodos permite comprobar que la build ARM64 reproduce el comportamiento del binario oficial x64 antes de desplegarla en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de fuerza de juego (Elo, CCRL, etc.) en la información disponible. Los únicos datos objetivos aportados son de verificación funcional:

| Prueba | Resultado | Contexto |
|---|---|---|
| Bench (nodos) | 440.703 | Coincide con el binario oficial x64 |
| Perft(5) posición inicial | 4.865.609 | Correcto |
| Handshake UCI | Funciona | En emulación ARM64 |
| Búsqueda | Funciona | En emulación ARM64 |
| Velocidad en teléfono físico | No verificada | Pendiente de prueba real |
| Compatibilidad con GUI | No verificada | Pendiente de prueba real |

## Requisitos de hardware

- Plataforma: Android 10 o superior (API 29), arquitectura ARM64.
- Alineación ELF preparada para dispositivos con páginas de 4 KB y 16 KB.
- VRAM: no aplica; el motor es CPU-only y la red NNUE va embebida en el binario.
- GPU: no requiere GPU; no se documenta aceleración por GPU.
- Memoria: configuración inicial recomendada de Hash 64 MB y Threads 1; el valor de Hash es ajustable según la RAM del dispositivo.
- Almacenamiento: el binario ocupa 89.932.544 bytes; el repositorio completo, 0,2 GB.
- Despliegue: binario UCI externo (DroidFish u otras GUI compatibles con binarios Android) o APK proveedor OEX (Chessis).
- Latencia y throughput: no disponibles; no se ha medido en hardware físico.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros motores de ajedrez Android ni resultados comparativos de fuerza o velocidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona fuera del ajedrez y no soporta tool calling ni agentes.
- Verificación incompleta: las pruebas se hicieron mediante emulación de usuario ARM64, no en un teléfono físico; la velocidad real y la compatibilidad con GUI quedan sin confirmar.
- La instalación y el descubrimiento del APK OEX no se han probado en un dispositivo Android físico.
- La compatibilidad de DroidFish con Android 16 requiere prueba en teléfono.
- El binario standalone es un motor UCI, no una aplicación de ajedrez con tablero; necesita una GUI que lo lance.
- Las GUI que solo admiten OEX requieren el APK wrapper incluido.
- Sin optimizaciones NEON escritas a mano: el rendimiento depende de la vectorización automática del compilador.
- Licencia AGPL-3.0: cualquier distribución o servicio en red basado en el motor debe cumplir las obligaciones de liberación de código fuente correspondiente; el wrapper OEX es Apache 2.0.
- Sin descargas ni interacciones en HuggingFace en el momento de la consulta; no hay evidencia de comunidad ni mantenimiento continuado.
- No se documentan sesgos ni riesgo de alucinación por no ser un modelo generativo, pero tampoco hay datos sobre la calidad de la red NNUE ni sobre su fuerza relativa frente a otros motores.

## Enlaces

- HuggingFace: https://huggingface.co/wraith1337/ravager3-android-arm64
- Repositorio original del motor: https://github.com/erensh27/Ravager
- Commit de origen: `a6497e92bfe865a94a92c443c1bc9fbb38a832fb` (etiqueta `v3`) en el repositorio anterior
- Fuente completa incluida en el repo: `ravager-source-android-arm64-full.tar.gz`
- Notas de compilación NDK: `BUILD-NOTES.txt` (incluido en el repo)
- APK proveedor OEX: `Ravager3-Android-arm64-OEX.apk` (incluido en el repo)
- Fuente del wrapper OEX: `ravager-oex-wrapper-source.tar.gz` (incluido en el repo)
- SHA-256 del binario: `781fd695988b1d9983b91755f94e238c926d164ce40fddfd620d6039cc46d83e`
