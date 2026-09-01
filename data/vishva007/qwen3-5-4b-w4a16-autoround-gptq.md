# Vishva007/Qwen3.5-4B-W4A16-AutoRound-GPTQ

## Resumen

Vishva007/Qwen3.5-4B-W4A16-AutoRound-GPTQ es una versión cuantizada del modelo multimodal Qwen3.5-4B de Alibaba, producida por el desarrollador Vishva007 utilizando AutoRound, el toolkit de cuantización de Intel basado en descenso de gradiente por signo. El resultado es un modelo con pesos en 4 bits y activaciones en 16 bits (W4A16) que mantiene la torre de visión en BF16 para preservar la precisión en tareas de razonamiento visual y OCR. La cuantización reduce aproximadamente un 50 % el uso de memoria respecto al modelo base en FP16, lo que permite desplegarlo en GPUs de gama media o consumer.

El modelo conserva las capacidades del Qwen3.5-4B original: procesamiento de imágenes y texto, razonamiento, generación de texto y soporte para Multi-Token Prediction (MTP), que habilita decodificación especulativa en backends compatibles como vLLM. Está pensado para entornos de producción donde se necesita un equilibrio entre calidad y eficiencia, y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial. Aunque el repositorio no incluye benchmarks propios, la configuración de calibración (1000 iteraciones, 512 muestras) apunta a una degradación mínima respecto al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5-4B) con torre de visión |
| Parametros totales | 4.539.265.536 (4,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones FP16), GPTQ/AutoRound, group size 16, simétrico |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ/AutoRound) |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3.5-4B, un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje. La cuantización se realizó con AutoRound, que optimiza los pesos mediante descenso de gradiente por signo, con group size 16, cuantización simétrica, 1000 iteraciones y 512 muestras de calibración sobre una longitud de secuencia de 4096 tokens. La torre de visión (quant_nontext_module) se mantiene en BF16 para no degradar el rendimiento en tareas visuales, y los módulos de Multi-Token Prediction (mtp, mtp.fc) también se conservan en bfloat16. El proceso incluyó torch compile para acelerar la calibración. No se especifica el dataset de entrenamiento del modelo base, pero Qwen3.5-4B es un modelo de propósito general entrenado con datos multilingües y multimodales.

## Capacidades

- Generación de texto y razonamiento: mantiene las capacidades del Qwen3.5-4B, incluyendo razonamiento paso a paso y respuestas conversacionales.
- Procesamiento de imágenes: al ser un modelo image-text-to-text, puede recibir imágenes como entrada y generar texto descriptivo, responder preguntas visuales o realizar OCR.
- Multi-Token Prediction (MTP): soporta decodificación especulativa con un token especulativo por defecto, configurable en vLLM mediante `--speculative_config '{"method":"mtp","num_speculative_tokens":1}'`.
- Compatibilidad con backends de inferencia: funciona con transformers, vLLM, SGLang y AutoGPTQ, lo que facilita su integración en pipelines existentes.
- Cuantización eficiente: los pesos en 4 bits reducen la huella de memoria y mejoran el throughput en GPUs con VRAM limitada.

## Casos de uso

- Despliegue en producción con vLLM: el modelo puede servirse con vLLM activando MTP para decodificación especulativa, lo que acelera la generación en entornos de alta concurrencia. Es adecuado para APIs de chat o asistentes virtuales.
- Razonamiento visual en dispositivos con recursos limitados: al mantener la torre de visión en BF16 y cuantizar el resto, permite ejecutar tareas de VQA (visual question answering) o análisis de documentos en GPUs consumer de 8-12 GB.
- OCR y extracción de información de imágenes: gracias a la preservación de la torre de visión, puede utilizarse para extraer texto de capturas, facturas o documentos escaneados con buena precisión.
- Generación de código asistida por imagen: el modelo base Qwen3.5-4B tiene capacidades de código; con la entrada visual, puede ayudar a depurar interfaces o diagramas.
- Chat multimodal en edge computing: su tamaño reducido (4,5 B parámetros cuantizados) permite ejecutarlo en estaciones de trabajo con una sola GPU, por ejemplo una RTX 3090 o 4090.
- Experimentación con cuantización: sirve como referencia para evaluar el impacto de AutoRound W4A16 en un modelo multimodal, comparando calidad frente a la versión FP16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales. Se recomienda consultar la página del modelo base Qwen/Qwen3.5-4B para conocer el rendimiento original y asumir una degradación típica de la cuantización W4A16 (generalmente inferior al 2-3 % en tareas estándar, aunque no hay datos confirmados para este modelo concreto).

## Requisitos de hardware

- VRAM estimada: con 4,5 B parámetros y pesos en 4 bits, el uso de memoria para los pesos es de aproximadamente 2,3 GB (4,5 B × 0,5 bytes). Añadiendo activaciones, KV cache y overhead, se estima un consumo total de 4-6 GB en inferencia con secuencias cortas, y más con contexto largo.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 3090, RTX 4090, o GPUs de datacenter como A10 o L4. Cabe en GPUs consumer con 8 GB o más, aunque para secuencias largas se recomienda 12 GB o superior.
- Opciones de despliegue: vLLM (con soporte MTP), SGLang, AutoGPTQ, transformers con integración GPTQ, y llama.cpp si se convierte a GGUF (no incluido en el repositorio).
- Latencia y throughput: no hay datos publicados. Con MTP y vLLM en una RTX 3090, se puede esperar un throughput de decenas de tokens por segundo, pero depende de la longitud de secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (base) | 4,5 B | FP16/BF16 | No disponible | Apache-2.0 | Modelo original sin cuantizar, mayor precisión pero más memoria |
| Vishva007/Qwen3.5-4B-W4A16-AutoRound-GPTQ | 4,5 B | W4A16 (4 bits) | No disponible | Apache-2.0 | Versión cuantizada, ~50 % menos memoria |
| Vishva007/Qwen3.5-0.8B-W4A16-AutoRound-GPTQ | 0,8 B | W4A16 (4 bits) | No disponible | Apache-2.0 | Versión más pequeña del mismo autor, para entornos muy limitados |

No se dispone de comparativas con otros modelos cuantizados de la misma familia (p. ej., versiones GGUF de Qwen3.5-4B) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W4A16 puede introducir una degradación leve en la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas, aunque AutoRound está diseñado para minimizarla.
- La torre de visión se mantiene en BF16, lo que aumenta ligeramente el uso de memoria en comparación con una cuantización completa del modelo.
- No se han publicado benchmarks propios, por lo que el rendimiento real en tareas específicas debe validarse antes de usar en producción.
- La longitud de contexto no está documentada en la model card; se recomienda consultar la página del modelo base para conocer el límite real.
- No hay información sobre sesgos o alucinaciones específicas de esta versión cuantizada; se heredan las características del modelo base.
- Aunque la licencia es Apache-2.0, el uso comercial está permitido, pero se debe verificar que los pesos cuantizados no incorporen restricciones adicionales por parte de herramientas de cuantización (no se indica ninguna).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.5-4B-W4A16-AutoRound-GPTQ
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de AutoRound (Intel): https://github.com/intel/auto-round
- Perfil del autor en Hugging Face: https://huggingface.co/Vishva007
- Ejemplo de despliegue en 2x RTX 3090 con vLLM y MTP: https://github.com/tonyd2wild/Qwen3.8-27B-AutoRound-W4A16-2x3090/tree/main/
