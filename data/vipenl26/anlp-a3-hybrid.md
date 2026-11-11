# vipenl26/anlp-a3-hybrid

## Resumen
anlp-a3-hybrid es un modelo de secuencia decoder-only de tipo híbrido desarrollado por vipenl26 para la asignatura ANLP Monsoon 2026 (Assignment 3, Part A). Se trata de un modelo implementado desde cero en PyTorch, sin dependencia de librerías como `mamba-ssm` o `fla`, lo que lo convierte en un artefacto académico orientado a demostrar la implementación de arquitecturas híbridas más que a un uso en producción.

El modelo tiene 3.876.672 parámetros, una dimensión de modelo de 256 y 10 capas, con una longitud máxima de secuencia de 256 tokens. Se entrenó como prefix LM sobre el formato `[BOS] ciphertext [SEP] plaintext [EOS]`, calculando la pérdida únicamente sobre el span del plaintext, y alcanzó una accuracy de validación de 0,7183 sobre tokens.

La relevancia de este modelo es limitada fuera del contexto académico: la propia model card advierte que el cifrado liberado en la tarea es un one-time pad por posición en el que el símbolo cifrado es estadísticamente independiente del carácter de plaintext que codifica. Por tanto, los checkpoints se comportan como modelos de lenguaje a nivel de carácter con una pista exacta de longitud, no como descifradores reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida decoder-only (sequence model) |
| Parámetros totales | 3.876.672 |
| Parámetros activos | no disponible |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.0 GB; carga vía `load_checkpoint` de `part1.hf_utils`) |

## Arquitectura y entrenamiento
La arquitectura es de tipo híbrido decoder-only, con `d_model = 256` y 10 capas, implementada manualmente en PyTorch sin usar `mamba-ssm` ni `fla`. El coste analítico declarado es de 2.253.477.202 FLOPs por secuencia de 256 tokens. El modelo se entrenó como prefix LM sobre la concatenación `[BOS] ciphertext [SEP] plaintext [EOS]`, aplicando la pérdida solo en el span del plaintext, con una tasa de aprendizaje de 0,001 y condicionamiento por cifrado real (cipher conditioning).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación destacable es la implementación from scratch de un modelo híbrido con condicionamiento de cifrado, aunque la propia model card aclara que la tarea subyacente es degenerada: el cifrado es un one-time pad por posición y solo la longitud del plaintext es recuperable, de modo que el modelo actúa como un LM de caracteres con pista de longitud exacta.

## Capacidades
- Generación de texto a nivel de carácter sobre secuencias de hasta 256 tokens.
- Modelado de lenguaje condicionado por un prefijo de cifrado (cipher conditioning).
- Predicción de la longitud del plaintext a partir de la estructura del ciphertext.
- Razonamiento de secuencia limitado al formato prefix LM entrenado.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo.
- No se documenta modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso
- Reproducción académica de arquitecturas híbridas: sirve como referencia para estudiar la implementación from scratch de modelos híbridos decoder-only en PyTorch, comparando FLOPs y accuracy con otras variantes del assignment.
- Experimentos de modelado a nivel de carácter: el modelo puede usarse como LM de caracteres con pista de longitud en tareas controladas de laboratorio, dado que su vocabulario y contexto están acotados a 256 tokens.
- Estudio de condicionamiento por prefijo: útil para analizar cómo un prefix LM aprende a explotar información estructural (longitud) cuando el contenido del prefijo es estadísticamente independiente del objetivo.
- Docencia y evaluación de assignments: sirve como checkpoint de referencia para comparar resultados de validación (0,7183 de accuracy) frente a implementaciones alternativas.
- Análisis de limitaciones de cifrados one-time pad: permite demostrar empíricamente por qué un OTP por posición no es recuperable más allá de la longitud.
- Prototipado de pipelines de carga de checkpoints: el snippet de `load_checkpoint` con `snapshot_download` puede reutilizarse como plantilla para otros checkpoints académicos.
- No es adecuado para despliegues en producción, atención al cliente, generación de código ni tareas de razonamiento general.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas internas de entrenamiento:

| Métrica | Valor |
|---|---|
| Parámetros | 3.876.672 |
| d_model / capas | 256 / 10 |
| Longitud máxima de secuencia | 256 |
| FLOPs analíticos / secuencia de 256 tokens | 2.253.477.202 |
| Mejor accuracy de validación (tokens) | 0,7183 |
| Learning rate | 0,001 |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; con ~3,9 M de parámetros, la huella en precisión completa es inferior a 20 MB, pero no se documenta el formato de pesos ni la cuantización.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna sería suficiente, pero no se confirma compatibilidad.
- Cabe en GPU consumer: previsiblemente sí por el reducido número de parámetros, aunque no se especifica en la información disponible.
- Opciones de despliegue: carga vía `huggingface_hub.snapshot_download` y `part1.hf_utils.load_checkpoint` con `device="cuda"`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. No se han proporcionado modelos comparables de la misma categoría (modelos híbridos académicos de ~3,9 M de parámetros) en la información disponible.

## Limitaciones y advertencias
- El cifrado de la tarea es un one-time pad por posición: el símbolo cifrado es estadísticamente independiente del carácter de plaintext, por lo que el modelo no descifra, solo recupera la longitud.
- Los checkpoints se comportan como LM de caracteres con pista de longitud, no como descifradores, según la propia model card.
- Contexto muy limitado: 256 tokens máximo.
- Sin información sobre idiomas soportados ni sobre sesgos conocidos.
- Riesgo de alucinación no evaluado en la información disponible.
- Licencia MIT permite uso comercial, pero el modelo es un artefacto académico sin validación para producción.
- Repo de 0.0 GB y 0 descargas/0 likes: no hay evidencia de uso comunitario ni mantenimiento.
- Dependencia de código externo (`part1.hf_utils`) para la carga, no incluido en el repo de Hugging Face.

## Enlaces
- Hugging Face: https://huggingface.co/vipenl26/anlp-a3-hybrid
