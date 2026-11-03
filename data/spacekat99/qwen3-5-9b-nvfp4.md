# spacekat99/Qwen3.5-9B-NVFP4

## Resumen

Qwen3.5-9B-NVFP4 es una cuantización en formato NVFP4 (FP4 de NVIDIA, 4 bits) del modelo multimodal Qwen3.5-9B del equipo Qwen (Alibaba), publicada por el usuario spacekat99 bajo la organización IG1. El modelo base es un transformer híbrido con arquitectura Mamba (atención lineal combinada con atención completa) capaz de procesar entradas de imagen y texto y generar texto, con 9.409.813.744 parámetros totales. Esta versión cuantizada reduce el peso del repositorio a 11,2 GB, lo que facilita su despliegue en GPUs de consumo con VRAM limitada.

La relevancia de esta ficha radica en que la cuantización NVFP4 permite ejecutar un modelo multimodal de ~9,4 mil millones de parámetros en una única GPU de 32 GB (RTX 5090) manteniendo un contexto de hasta 110.880 tokens según la configuración documentada por el autor. El autor advierte que la arquitectura híbrida Mamba de Qwen3.5 no funciona bien con caché KV en FP8, por lo que recomienda no activarla y ajustar los parámetros de captura de CUDA graphs para maximizar el espacio disponible para el contexto.

El modelo se distribuye con licencia Apache 2.0 y está pensado para servir mediante vLLM con el parser de razonamiento `qwen3` y el parser de tool calling `qwen3_coder`. Incluye un proxy inverso ligero (qwen35-rp) que expone los cuatro perfiles de muestreo oficiales de Qwen3.5 (Thinking General, Thinking Coding, Instruct General e Instruct Reasoning) como nombres de modelo virtuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Mamba (atención lineal + atención completa), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 110.880 tokens en configuración RTX 5090 documentada; `--max-model-len auto` por defecto |
| Tipos de cuantizacion | NVFP4 (4 bits, compressed-tensors, 8-bit en tags); pesos cuantizados con llm-compressor |
| Idiomas soportados | no disponible (el dataset de calibración incluye muestras multilingües de Aya, pero no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), librería transformers |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B emplea una arquitectura híbrida que combina capas de atención lineal tipo Mamba con capas de atención completa. Esta mezcla se refleja en las dimensiones de cabeza: 256 para atención completa frente a 128 para atención lineal, un detalle que el autor señala como causa de corrupción al intentar cuantizar la caché KV en FP8 estático. El modelo es multimodal (pipeline image-text-to-text), por lo que acepta imágenes y texto como entrada.

Esta versión concreta no ha sido reentrenada: es una cuantización post-entrenamiento realizada con llm-compressor v0.10.1.dev31+geb49917e y transformers v5.3.0, partiendo del ejemplo oficial de NVFP4 para Qwen3.5. El autor modificó la receta aumentando la longitud de secuencia de 4096 a 8192 y el número de muestras de calibración de 256 a 1024, distribuidas en cuatro datasets: 256 muestras de conversación general (UltraChat), 256 de razonamiento matemático (GSM8K), 256 de código (CodeAlpaca) y 256 multilingües (Aya). Los ficheros de tokenizador originales de transformers v4 se restauraron para compatibilidad con versiones actuales de vLLM; los de transformers v5 se conservan en la carpeta `transformers_v5`.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes junto con texto (image-text-to-text).
- Razonamiento matemático, calibrado específicamente con muestras de GSM8K.
- Generación de código, calibrada con muestras de CodeAlpaca.
- Capacidades multilingües, calibradas con el dataset Aya.
- Modos dinámicos de pensamiento (thinking) y no pensamiento (non-thinking).
- Cuatro perfiles de muestreo oficiales: Thinking General, Thinking Coding, Instruct General e Instruct Reasoning.
- Tool calling / function calling, con soporte en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Razonamiento multi-paso mediante el parser de razonamiento `qwen3` (`--reasoning-parser qwen3`).
- Compatibilidad con endpoints estilo OpenAI a través de vLLM.

## Casos de uso

- Asistente conversacional multimodal autoalojado: el modelo acepta imágenes y texto y puede gestionar conversaciones multi-turno con una ventana de contexto de hasta 110.880 tokens en una RTX 5090, lo que permite adjuntar documentos o capturas extensas sin truncar.
- Generación de código en pipelines internos: gracias al soporte de tool calling y al parser `qwen3_coder`, puede integrarse en flujos de CI/CD o en asistentes de IDE que invocan herramientas externas (ejecutar tests, consultar repositorios) mediante function calling.
- Razonamiento matemático asistido: el modo thinking y la calibración con GSM8K lo hacen adecuado para resolver problemas paso a paso en entornos educativos o de análisis financiero, mostrando la cadena de razonamiento mediante el parser `qwen3`.
- Atención al cliente automatizada: el despliegue con vLLM y endpoints compatibles con OpenAI permite sustituir APIs externas por una instancia local, con contexto largo para historiales de conversación y capacidad de invocar herramientas de consulta de pedidos.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer información de capturas, formularios o gráficos combinándola con instrucciones textuales, útil en digitalización de archivos o extracción de datos.
- Despliegue en estación de trabajo con GPU de consumo: la cuantización NVFP4 y la configuración documentada para RTX 5090 (32 GB) permiten ejecutar el modelo en local sin depender de clústeres, por ejemplo para prototipado de agentes o investigación con datos sensibles que no deben salir de la máquina.
- Servicio multi-perfil mediante proxy: el proyecto qwen35-rp expone los cuatro perfiles de muestreo como nombres de modelo virtuales sobre un único servidor de inferencia, lo que simplifica ofrecer modos "thinking" e "instruct" a distintos clientes sin reconfigurar cada uno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 11,2 GB en NVFP4; con overhead de ejecución y caché KV, el autor documenta un despliegue funcional en una RTX 5090 de 32 GB con `--gpu-memory-utilization 0.95` y `--max-cudagraph-capture-size 64`, obteniendo un contexto máximo de 110.880 tokens.
- GPU recomendadas: RTX 5090 (32 GB) es la plataforma objetivo documentada; GPUs con más VRAM (A100, H100) permitirían contextos mayores o más secuencias concurrentes, aunque no se aportan cifras concretas para ellas.
- Cabe en GPU de consumo: sí, en RTX 5090 según la configuración del autor. No se confirma para GPUs con menos de 32 GB.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:v0.18.0-cu130`), con soporte de transformers; no se documentan llama.cpp, Ollama ni TGI para este formato NVFP4.
- Latencia y throughput: no disponibles. El autor recomienda ajustar `--max-cudagraph-capture-size` y `--max-num-seqs` al número teórico de peticiones paralelas esperadas para liberar espacio de caché KV.
- Advertencia de despliegue: no usar caché KV en FP8 (`--kv-cache-dtype fp8_e4m3`); el autor reporta degradación a texto incoherente con escalas dinámicas y corrupción permanente de los pesos si se usan escalas estáticas durante la calibración.
- En Windows con Docker WSL se debe reducir la memoria total disponible por el uso de VRAM del entorno gráfico del host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| spacekat99/Qwen3.5-9B-NVFP4 | 9.409.813.744 | Hasta 110.880 tokens (config. RTX 5090) | Image-text-to-text | Apache 2.0 | safetensors NVFP4 |
| Qwen/Qwen3.5-9B (base) | 9.409.813.744 | no disponible en la informacion | Image-text-to-text | Apache 2.0 | safetensors (precision original) |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de otros fabricantes en la información proporcionada, por lo que la comparación se limita al modelo base y a variantes del mismo.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce pérdida de precisión respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.
- La caché KV en FP8 no es compatible con esta arquitectura híbrida Mamba según las pruebas del autor: puede producir texto incoherente o corromper los pesos durante la calibración.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-03), por lo que no hay validación comunitaria ni histórico de uso en producción.
- No se declara la lista de idiomas soportados; el calibrado multilingüe con Aya no garantiza cobertura uniforme.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-9B; conviene revisar la licencia original enlazada.
- Requiere versiones concretas de herramientas: llm-compressor v0.10.1.dev31+geb49917e, transformers v5.3.0 para la cuantización y vLLM v0.18.0-cu130 para la inferencia documentada; otras versiones pueden no ser compatibles.
- El contexto máximo efectivo depende de la VRAM disponible y de los parámetros de captura de CUDA graphs; en GPUs con menos de 32 GB no se documenta un despliegue viable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/spacekat99/Qwen3.5-9B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Script de cuantización: https://huggingface.co/spacekat99/Qwen3.5-9B-NVFP4/blob/main/Qwen3.5-9B_nvfp4.py
- Ejemplo docker-compose: https://huggingface.co/spacekat99/Qwen3.5-9B-NVFP4/blob/main/docker-compose.yaml
- Proxy de perfiles qwen35-rp: https://github.com/iguanesolutions/qwen35-rp
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Ejemplo oficial NVFP4 para Qwen3.5: https://github.com/vllm-project/llm-compressor/blob/36fab734a744b4f46b7b379b7c4b4b3f47fde3bf/docs/key-models/qwen3.5/nvfp4-moe-example.md
- Perfiles de muestreo Qwen3.5: https://huggingface.co/Qwen/Qwen3.5-9B#using-qwen35-via-the-chat-completions-api
