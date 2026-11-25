# Thunai-edge/Qwen3.5-2B-colibri

## Resumen

Qwen3.5-2B-colibri es una conversión de formato del modelo Qwen/Qwen3.5-2B (revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`) al formato de contenedor propietario del motor de inferencia Colibrì, desarrollado por JustVugg. La conversión la firma Thunai-edge y se realizó con la herramienta `tools/convert_qwen36.py` del propio repositorio de Colibrì, en el commit `0a5504a1dc64f86fcd0fe7db298b0448c730e7e6`. No hay reentrenamiento ni ajuste fino: los pesos son los originales de Qwen, empaquetados para que el motor Colibrì pueda cargarlos.

El paquete incluye tanto el modelo de texto como la torre de visión del Qwen3.5-2B original, lo que lo convierte en un contenedor multimodal listo para tareas de comprensión de capturas de pantalla y generación de resúmenes. El caso de uso declarado por el autor es la inferencia local en CPU, sin GPU, lo que sitúa al modelo en el segmento de despliegue en dispositivos de gama baja o entornos sin acelerador.

La relevancia de esta ficha es doble: por un lado, documenta un modelo pequeño (2B parámetros) con capacidades de visión y licencia Apache 2.0, útil para prototipos locales; por otro, ilustra el patrón de distribución de pesos en formatos alternativos a safetensors o GGUF, atados a un motor concreto y a un commit fijo. El repositorio ocupa 5,6 GB y acumula 42 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-2B; el contenedor incluye torre de visión) |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el contenedor Colibrì no declara cuantizaciones; el repo pesa 5,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor propietario de Colibrì (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del Qwen3.5-2B en la documentación proporcionada. La model card del contenedor solo indica que se trata de una conversión de formato sin reentrenamiento: los pesos son idénticos a los del modelo base de Qwen, y la herramienta de conversión únicamente los reempaqueta en el contenedor de Colibrì. El paquete incluye el modelo de texto y la torre de visión, por lo que el contenedor es multimodal aunque no se detallen los detalles del encoder visual.

Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Cualquier afirmación sobre estos puntos sería especulativa y no se incluye.

## Capacidades

- Generación de texto: el modelo base es un modelo de lenguaje de 2B parámetros, por lo que puede producir texto coherente en tareas generales.
- Comprensión de imágenes: el contenedor incluye la torre de visión del Qwen3.5-2B, lo que permite procesar capturas de pantalla e imágenes para tareas de descripción y resumen.
- Resumen de capturas de pantalla: caso de uso explícito del autor (Thunai Edge lo usa para resúmenes locales y comprensión de screenshots).
- Inferencia en CPU: el motor Colibrì está pensado para ejecución local sin GPU.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Resumen local de capturas de pantalla: el autor declara que Thunai Edge usa este contenedor para entender screenshots y generar resúmenes en local. La torre de visión incluida permite pasar una imagen al modelo y obtener una descripción textual sin enviar datos a la nube.
- Asistencia en entornos sin GPU: al estar empaquetado para Colibrì, que ejecuta en CPU, el modelo puede desplegarse en portátiles, mini-PC o servidores sin acelerador, útil para entornos con restricciones de hardware.
- Procesamiento de documentos escaneados en local: con la torre de visión, se pueden pasar imágenes de páginas o formularios y obtener texto descriptivo, manteniendo los datos en el dispositivo.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo de 2B con licencia Apache 2.0, sirve para validar pipelines de visión-lenguaje antes de invertir en modelos mayores.
- Automatización de soporte técnico con capturas de error: un usuario envía una captura de pantalla de un error y el modelo genera una descripción del problema que se puede enrutar a un sistema de tickets.
- Generación de descripciones de imágenes para accesibilidad: el modelo puede producir texto alternativo para imágenes en aplicaciones locales, con la ventaja de que el procesamiento no sale del dispositivo.
- Integración en herramientas de escritorio: el formato de contenedor y el motor Colibrì permiten incrustar el modelo en aplicaciones de escritorio que necesiten resumir imágenes o texto sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso de uso principal, ya que Colibrì está diseñado para ejecución en CPU. Para una estimación orientativa en GPU, un modelo de 2B parámetros en FP16 requiere aproximadamente 4 GB de pesos, pero no se dispone de datos oficiales del contenedor.
- GPU recomendadas: no disponible. El autor no documenta despliegue en GPU; el motor Colibrì se presenta como CPU-only.
- ¿Cabe en GPU de consumo? No disponible. Por tamaño (2B) cabría en GPUs de consumo con suficiente VRAM en FP16, pero no hay confirmación de que Colibrì soporte aceleración por GPU.
- Opciones de despliegue: Colibrì (`coli serve --model /path/to/this/folder`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato de pesos propietario probablemente impide usarlos sin reconversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-colibri | 2B | no disponible | Sí (torre incluida) | Apache 2.0 | contenedor Colibrì | Hugging Face, 42 descargas |
| Qwen/Qwen3.5-2B (original) | 2B | no disponible | Sí (según el contenedor) | Apache 2.0 | safetensors (previsible) | Hugging Face |
| Alternativas de 2B con visión | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. La diferencia principal entre el contenedor y el original es el formato: el contenedor solo es utilizable con el motor Colibrì, mientras que el original puede cargarse con frameworks estándar.

## Limitaciones y advertencias

- El formato de pesos es propietario de Colibrì y está atado a un commit fijo del motor. Cualquier otra herramienta (transformers, vLLM, llama.cpp) no podrá cargarlo sin una reconversión.
- El autor advierte explícitamente de que no se renombren, editen ni eliminen archivos del repositorio, y de que no se reescriba su historial: las builds de la aplicación descargan desde un commit fijo y verifican el SHA-256 de cada archivo.
- No hay información sobre sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- El modelo base es de 2B parámetros, por lo que su capacidad de razonamiento y su conocimiento factual son limitados en comparación con modelos mayores; no se recomienda para tareas que exijan alta precisión sin verificación.
- La licencia Apache 2.0 permite uso comercial, pero el contenedor incluye un aviso de modificación (`NOTICE`) de Thunai que conviene revisar antes de redistribuir.
- No se documentan los idiomas soportados; no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- El pipeline no está declarado en Hugging Face, lo que dificulta la integración automática con herramientas que dependen de ese metadato.
- El número de descargas (42) y de likes (0) es muy bajo, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thunai-edge/Qwen3.5-2B-colibri
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Motor Colibrì: https://github.com/JustVugg/colibri
