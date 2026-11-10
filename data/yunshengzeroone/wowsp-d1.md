# YunShengZeroOne/wowsp-d1

## Resumen

WoWSP decision models (identificador `YunShengZeroOne/wowsp-d1`) es un conjunto de modelos ONNX de decisión y puntuación desarrollados por el autor YunShengZeroOne para WoWSP, una herramienta de análisis de repeticiones y superposición en juego para World of Warships. No se trata de un modelo de lenguaje generativo, sino de una colección de cuatro redes neuronales pequeñas (entre 0,5 MB y 2,7 MB cada una) que el cliente de la aplicación carga a través de un canal de modelos firmado con Ed25519. El repositorio es un artefacto de publicación generado automáticamente, no un espacio de desarrollo.

El paquete incluye `fire_model.onnx` (dos cabezas, conjunto de características fire-v1), `move_model.onnx` (una cabeza, move-v1), `advice_fire_model.onnx` (dos cabezas, advice-e24) y `torpedo4_model.onnx` (tres cabezas, torp4-v1), además de una tabla de atributos de barcos en JSON de 261 KB. Un quinto modelo de torpedos de la generación anterior (torpedo-e26d) quedó retirado el 2026-11-10 y solo se conserva como etiqueta de Git.

Su relevancia es acotada y muy específica: sirve como ejemplo de despliegue de modelos ONNX de baja latencia con verificación criptográfica de integridad, contrato de características versionado y actualizaciones incrementales por debajo de 10 MB. No es un modelo de propósito general ni un LLM, por lo que las métricas habituales de MMLU, HumanEval o GSM8K no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales ONNX especializadas por tarea (fire-two-head, move-sectors-17, advice-fire-attrs, torpedo-t4-three-head); topología interna no disponible |
| Parametros totales | no disponible (solo se publican tamanos de archivo: 2.592.543 B, 2.652.542 B, 2.595.135 B y 502.518 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de decisión por fotograma/estado, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX sin especificar precisión: FP32/FP16/INT8 no declarados) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; salidas numéricas de decisión) |
| Licencia | Synthetic Source License 1.0 (SySL-1.0), etiquetada como `other` en el Hub |
| Formato de pesos | ONNX (`.onnx`) más `ship_attributes.json` y `manifest.json` firmado con Ed25519 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de las redes (número de capas, dimensión de las representaciones, funciones de activación). Lo que sí se declara es el contrato de entrada y salida por ranura: `fire_model.onnx` expone dos cabezas sobre el conjunto de características fire-v1; `move_model.onnx` una cabeza sobre move-v1; `advice_fire_model.onnx` dos cabezas sobre advice-e24; y `torpedo4_model.onnx` tres cabezas sobre un vector global de 49 dimensiones (torp4-v1). El modelo retirado `torpedo_model.onnx` usaba el conjunto torpedo-e26d con dos cabezas.

El entrenamiento se basa en características derivadas de sesiones de repetición aportadas por usuarios; no se publican repeticiones en bruto, identificadores de jugadores ni archivos del juego. Los scripts de entrenamiento y despliegue se conservan en el repositorio de GitHub bajo `training/` para reproducibilidad, y el registro `scripts/experiments/model_registry.json` es la fuente de verdad. No se documenta el número de tokens, el volumen de muestras, la composición del dataset ni si hubo ajuste por refuerzo o preferencias; tampoco se describen innovaciones como decodificación especulativa o atención lineal, que no tienen sentido en este tipo de modelos.

## Capacidades

- Puntuación de decisiones de disparo: `fire_model.onnx` evalúa estados de combate y produce dos salidas (probablemente calidad de disparo y atributos asociados; la semántica exacta de las cabezas no se detalla).
- Sugerencia de movimiento por sectores: `move_model.onnx` clasifica o puntúa 17 sectores de movimiento sobre el mapa.
- Asesoramiento de disparo con atributos: `advice_fire_model.onnx` combina el estado con atributos de barco (conjunto advice-e24).
- Decisión de torpedos en tres cabezas: `torpedo4_model.onnx` procesa un vector global de 49 dimensiones y emite tres salidas (por ejemplo, lanzar, dirección y temporización; la correspondencia exacta no se especifica).
- Integración con datos de barcos: `ship_attributes.json` (261.507 bytes) actúa como tabla de enrutamiento de atributos derivada de datos del juego.
- Verificación de integridad en el cliente: el manifiesto firmado con Ed25519 fija cada archivo por SHA-256 y por commit de Hugging Face; el cliente valida el tipo ONNX y el ancho de las entradas antes de instalar.
- Actualizaciones incrementales: todos los archivos quedan por debajo de 10 MB, lo que permite actualizaciones pequeñas con reanudación por rangos sobre el CDN firmado.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un conjunto de modelos numéricos de apoyo a la decisión.

## Casos de uso

- Superposición en juego durante una partida de World of Warships: el cliente carga `fire_model.onnx` y `move_model.onnx` desde el manifiesto firmado y consulta las salidas por fotograma para mostrar recomendaciones de disparo y de sector de movimiento con latencia de milisegundos, gracias al tamaño reducido de los modelos.
- Análisis posterior de repeticiones: al procesar una repetición ya grabada, el pipeline extrae las características fire-v1 y move-v1 de cada estado y ejecuta los modelos para generar un informe de decisiones acertadas y erróneas del jugador.
- Asesoramiento táctico con contexto de barco: `advice_fire_model.onnx` consume el conjunto advice-e24, que incorpora atributos del barco desde `ship_attributes.json`, para adaptar la recomendación de disparo a las características concretas del navío.
- Selección de lanzamiento de torpedos: `torpedo4_model.onnx` recibe el vector global de 49 dimensiones y devuelve tres cabezas que el cliente traduce en una sugerencia de lanzamiento, útil en enfrentamientos a corta y media distancia.
- Distribución segura de actualizaciones de modelo: el equipo de WoWSP publica un nuevo `seq` en el manifiesto firmado y los clientes descargan solo los archivos modificados desde `/resolve/<commit-sha>/<path>`, verificando SHA-256 antes de instalar; el modelo retirado queda archivado como etiqueta de Git.
- Referencia para despliegue de modelos ONNX pequeños en aplicaciones de escritorio: el patrón de manifiesto firmado, contrato de características versionado (fire-v1, move-v1, advice-e24, torp4-v1) y límite de 10 MB por archivo sirve como plantilla para otros proyectos que necesiten actualizar pesos sin un cliente de Xet ni infraestructura pesada.
- Validación de integridad en entornos con amenazas: al fijar cada archivo por SHA-256 y por commit inmutable, el cliente puede rechazar pesos manipulados aunque el CDN intermedio sea comprometido, un requisito habitual en herramientas de superposición que se ejecutan junto al juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, latencia ni comparaciones con otros modelos; solo declara tamanos de archivo y sumas SHA-256 parciales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en total para los cuatro modelos ONNX (suma de pesos de 8,34 MB más el JSON de atributos de 261 KB); la memoria de trabajo depende del runtime ONNX y del tamano del lote, no disponible.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU integrada o dedicada con soporte ONNX Runtime es suficiente. No se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de las ultimas generaciones (por ejemplo, GTX 1050 o superior) e incluso en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), y por formato, cualquier runtime compatible con ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput estimados: no disponibles. Por el tamano (menos de 3 MB por modelo) se espera latencia de un solo dígito de milisegundos en CPU moderna, pero es una estimacion no confirmada por el autor.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (modelos ONNX de decision para analisis de repeticiones de World of Warships). Las alternativas habituales serian modelos genericos de clasificacion tabular, pero no se dispone de datos para comparar parametros, contexto, rendimiento ni licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite tool calling ni razonamiento multi-paso; cualquier uso fuera de la puntuacion de decisiones de WoWSP carece de sentido.
- La semantica exacta de las cabezas de cada modelo no se documenta en la model card; el integrador debe consultar `scripts/experiments/README.md` en el commit `23e41b1a77035e194e4ec09476766fbd54eb5d11` para conocerla.
- El repositorio es un artefacto generado: no debe editarse a mano; los cambios deben hacerse ejecutando `scripts/publish_ai_models.py` desde el checkout de GitHub.
- La licencia SySL-1.0 esta etiquetada como `other` en el Hub y su texto completo esta en el enlace al repositorio de GitHub; no se detallan en la informacion proporcionada las restricciones concretas para uso comercial, por lo que debe revisarse el archivo LICENSE antes de cualquier despliegue productivo.
- La tabla de atributos de barcos se deriva de datos del juego y los rasters de linea de vision (cuando estan presentes) de geometria de mapas publicada; existen implicaciones de propiedad intelectual que el aviso NOTICE.md recoge y que conviene revisar.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero si existe riesgo de recomendaciones erroneas si las caracteristicas de entrada no coinciden exactamente con el contrato del conjunto declarado (fire-v1, move-v1, advice-e24, torp4-v1); reutilizar un nombre de conjunto con semantica distinta esta prohibido por el contrato.
- Sesgos conocidos: no documentados; al entrenarse con repeticiones aportadas por usuarios, la distribucion de estilos de juego puede no representar a toda la poblacion de jugadores.
- Dependencia de la aplicacion WoWSP: los modelos no se distribuyen con una API independiente; su uso esta ligado al cliente que implementa el contrato de ejecucion y la verificacion Ed25519.
- El modelo de torpedos de la generacion anterior (torpedo-e26d) esta retirado y solo disponible como etiqueta de Git; no debe usarse en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YunShengZeroOne/wowsp-d1
- Manifiesto de ejecucion: https://huggingface.co/YunShengZeroOne/wowsp-d1/blob/main/manifest.json
- Licencia SySL-1.0: https://github.com/celestia-island/sysl
- Codigo fuente de WoWSP (commit de referencia): https://github.com/langyo/wowsp/tree/23e41b1a77035e194e4ec09476766fbd54eb5d11
- Scripts de entrenamiento y metricas: https://github.com/langyo/wowsp/blob/23e41b1a77035e194e4ec09476766fbd54eb5d11/scripts/experiments/README.md
- Registro de modelos (fuente de verdad): https://github.com/langyo/wowsp/blob/23e41b1a77035e194e4ec09476766fbd54eb5d11/scripts/experiments/model_registry.json
