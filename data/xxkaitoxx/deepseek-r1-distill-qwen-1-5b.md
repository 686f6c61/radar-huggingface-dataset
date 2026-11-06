# XxKaitoxX/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje denso de 1.777 millones de parametros obtenido por destilacion de DeepSeek-R1 sobre la base Qwen2.5-1.5B. Lo desarrolla DeepSeek AI dentro de la familia DeepSeek-R1, publicada junto con los checkpoints destilados de 1.5B, 7B, 8B, 14B, 32B y 70B. El repositorio concreto que se documenta aqui es una copia subida por el usuario XxKaitoxX a Hugging Face, sin descargas ni interacciones registradas en el momento de la consulta.

El modelo resuelve el problema de disponer de capacidades de razonamiento tipo cadena de pensamiento (chain-of-thought) en un tamano que cabe en hardware de consumo. Frente a entrenar razonamiento con RL directamente sobre un modelo pequeno, DeepSeek demuestra que destilar los patrones de razonamiento de un modelo grande produce resultados superiores. Es relevante porque permite experimentar con tecnicas de razonamiento, verificado y reflexion en entornos con recursos limitados.

La arquitectura es un transformer denso de tipo Qwen2, con licencia MIT, pesos en safetensors y compatibilidad con la libreria transformers y con text-generation-inference. La longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen2 (qwen2 en transformers) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos originales en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 3,6 GB |
| Pipeline | text-generation |
| Etiquetas | conversational, endpoints_compatible, text-generation-inference |

## Arquitectura y entrenamiento

El modelo es un transformer denso basado en Qwen2.5-1.5B, es decir, atencion por cabezas con sesgo QKV, RoPE y las capas estandar de la familia Qwen2. No es un modelo MoE ni hibrido SSM: todos los parametros se activan en cada token. El checkpoint se obtiene por destilacion supervisada: DeepSeek-R1 genera datos de razonamiento y esos datos se usan para ajustar finamente el modelo base pequeno. Segun la model card de la familia, los modelos destilados superan a los modelos pequenos entrenados con RL directo, lo que justifica el enfoque.

El pipeline original de DeepSeek-R1 combina dos etapas de RL (descubrimiento de patrones de razonamiento y alineacion con preferencias humanas) y dos etapas de SFT. La destilacion transfiere los patrones de cadena de pensamiento larga, autoverificacion y reflexion del modelo grande al modelo pequeno. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo DPO en la etapa de destilacion.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento explicito mediante cadenas de pensamiento largas, heredado de DeepSeek-R1.
- Autoverificacion y reflexion durante la generacion.
- Razonamiento matematico y resolucion de problemas paso a paso.
- Generacion y explicacion de codigo.
- Compatibilidad con text-generation-inference y con endpoints compatibles con la API de OpenAI.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles; la model card original advierte de mezcla de idiomas en los modelos R1-Zero, corregida parcialmente en R1.

## Casos de uso

- Prototipado de razonamiento en local: con 1.777 millones de parametros el modelo se ejecuta en una GPU de consumo o incluso en CPU con cuantizacion, lo que permite validar pipelines de chain-of-thought antes de escalar a variantes de 7B o 32B.
- Tutoria educativa de matematicas: el modelo genera pasos intermedios verificables, utiles para explicar ejercicios y detectar errores de razonamiento en el alumno.
- Asistente de codigo en el editor: al ser un modelo denso y pequeno, la latencia es baja y permite autocompletado o explicacion de fragmentos sin depender de una API externa.
- Generacion de datos sinteticos de razonamiento: se puede usar para producir trazas de cadena de pensamiento que alimenten el ajuste fino de otros modelos, replicando el propio proceso de destilacion de DeepSeek.
- Evaluacion de tecnicas de prompting: su tamano reducido permite comparar estrategias de few-shot, self-consistency o debate multiagente con coste bajo y resultados reproducibles.
- Despliegue en entornos con restricciones de privacidad: al ser MIT y ejecutable en local, encaja en escenarios donde los datos no pueden salir de la infraestructura del cliente, como analisis de documentos internos o clasificacion de incidencias.
- Investigacion sobre alucinacion y calibracion: el modelo emite cadenas de pensamiento observables, lo que facilita estudiar donde y por que se desvia el razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la familia menciona que DeepSeek-R1-Distill-Qwen-32B supera a OpenAI-o1-mini en varios benchmarks y que los destilados rinden mejor que modelos pequenos entrenados con RL, pero no se aportan cifras concretas para la variante de 1.5B.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 3,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 4 y 6 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 1 GB de pesos, aunque la cuantizacion no esta documentada en la informacion disponible.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090); en A100 o H100 se puede ejecutar con batch grande y contexto largo.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual, incluidas GPUs de portatil con 6-8 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta tgi), llama.cpp y Ollama mediante conversion a GGUF, y vLLM si se dispone de pesos compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B (este repo) | 1.777 M | no disponible | MIT | Destilado de R1 sobre Qwen2.5-1.5B |
| DeepSeek-R1-Distill-Qwen-7B | 7.000 M aprox. | no disponible | MIT | Misma receta de destilacion, mayor capacidad |
| DeepSeek-R1-Distill-Llama-8B | 8.000 M aprox. | no disponible | MIT | Base Llama 3, alternativa de tamano similar |
| Qwen2.5-1.5B (base) | 1.500 M aprox. | no disponible | no disponible | Modelo base sin destilacion de razonamiento |

No se dispone de datos de rendimiento comparado para esta variante concreta; la comparativa se limita a parametros, licencia y procedencia.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo modelo generativo, puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente en matematicas de varios pasos.
- Mezcla de idiomas: la model card original documenta este problema en R1-Zero; en los destilados se mitiga pero puede persistir en prompts no ingleses.
- Contexto limitado por el modelo base Qwen2.5-1.5B; la longitud exacta no esta disponible en la informacion proporcionada.
- Capacidad reducida frente a las variantes de 7B, 14B y 32B: no es adecuado para tareas que exijan conocimiento factual amplio o razonamiento muy profundo.
- Repositorio de terceros: el checkpoint lo ha subido el usuario XxKaitoxX, no DeepSeek AI; conviene verificar la integridad de los pesos frente al repositorio oficial antes de usarlo en produccion.
- Licencia MIT: permite uso comercial, pero el usuario debe revisar las condiciones del modelo base Qwen2.5 y de los datos de destilacion.
- Sin descargas ni validacion comunitaria registrada en el momento de la consulta, lo que reduce la confianza en el repositorio concreto.
- No se documentan capacidades de tool calling ni de agentes multi-paso; no asumirlas sin evaluacion previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/XxKaitoxX/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio oficial de DeepSeek-R1: https://huggingface.co/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/DeepSeek_R1.pdf
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Licencia MIT del proyecto: https://github.com/deepseek-ai/DeepSeek-R1/blob/main/LICENSE
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
