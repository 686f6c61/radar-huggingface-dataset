# V4ldeLund/gemma-3-1b-pt-faroese-experiment5

## Resumen

El modelo `V4ldeLund/gemma-3-1b-pt-faroese-experiment5` es un ajuste fino (fine-tune) del modelo base `google/gemma-3-1b-pt`, desarrollado por el usuario V4ldeLund, aparentemente vinculado a la Universidad Técnica de Dinamarca (DTU) según el enlace de Weights & Biases. Se trata de un experimento de entrenamiento supervisado (SFT) orientado a la lengua feroesa, como sugiere el nombre, aunque no se especifica explícitamente el dataset utilizado. El modelo tiene aproximadamente 1.000 millones de parámetros (999.885.952) y está diseñado para generación de texto.

La relevancia de este modelo radica en su naturaleza experimental: explora la adaptación de un modelo multilingüe de tamaño compacto a una lengua de bajos recursos como el feroés. Al estar basado en Gemma 3, hereda la arquitectura transformer decoder y, en principio, la ventana de contexto de 128K tokens del modelo original, aunque no se confirma si el fine-tune la mantiene. Es un ejemplo de cómo los modelos abiertos pueden especializarse en dominios lingüísticos específicos mediante SFT con herramientas como TRL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base tiene 128K, pero no se confirma en el fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere feroés, pero no está documentado) |
| Licencia | no disponible (la model card indica "licence: license", sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `google/gemma-3-1b-pt`, que corresponde a la variante pretrained (no instruct) de Gemma 3 con 1B parámetros. La arquitectura es un transformer decoder estándar, con atención de múltiples cabezas y mecanismos de normalización previa, tal como se describe en la documentación de Gemma 3. El entrenamiento se realizó mediante SFT (supervised fine-tuning) utilizando la librería TRL (versión 1.11.0) y el framework Transformers (5.16.1). No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del experimento sugiere que el dataset está relacionado con el feroés, pero no hay confirmación oficial.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 1B, puede generar texto coherente en el idioma o idiomas en los que fue entrenado, aunque no se especifica cuáles.
- Conversación: el ejemplo de uso en la model card muestra un pipeline de generación con un mensaje de usuario, lo que sugiere que el fine-tune podría haber incluido datos conversacionales, pero no está confirmado.
- Multilingüismo: el modelo base Gemma 3 soporta más de 140 idiomas, pero no se sabe si el fine-tune conserva esa capacidad o la reduce al feroés.
- No se documentan capacidades especiales como tool calling, agentes, visión o audio.

## Casos de uso

- Generación de texto en feroés: si el fine-tune se centró en esta lengua, podría usarse para redactar artículos, resúmenes o contenido creativo en feroés, aunque no hay evidencia pública de su calidad.
- Experimentación académica: sirve como referencia para estudiar el impacto del SFT en lenguas de bajos recursos, comparando con el modelo base.
- Prototipos de asistentes conversacionales: dado el ejemplo de uso con roles de usuario, podría integrarse en chatbots simples, pero requiere validación.
- Investigación en adaptación de modelos: útil para analizar cómo un modelo pequeño se comporta tras un fine-tune específico, con fines de investigación.
- Educación lingüística: podría emplearse en herramientas de práctica de escritura en feroés, aunque no hay datos de rendimiento.
- Desarrollo de datasets: el modelo puede servir para generar datos sintéticos en feroés, siempre que se valide su salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tune. Tampoco se comparan métricas con el modelo base o con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada: con 1B parámetros, en FP16 se necesitan aproximadamente 2 GB de VRAM solo para los pesos; en int8 o cuantizaciones de 4 bits, menos de 1 GB. Sin embargo, no se especifican cuantizaciones disponibles.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) puede ejecutar el modelo en FP16. Para mayor comodidad, una RTX 4090 o similar.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en GPUs de gama media.
- Opciones de despliegue: al ser un modelo de Transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan configuraciones específicas.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, se espera una latencia de decenas de milisegundos por token, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| V4ldeLund/gemma-3-1b-pt-faroese-experiment5 | ~1B | no disponible | no disponible | Fine-tune experimental para feroés |
| google/gemma-3-1b-pt | ~1B | 128K | Gemma (uso comercial permitido con restricciones) | Modelo base, multilingüe |
| google/gemma-3-1b-it | ~1B | 128K | Gemma | Versión instruct, optimizada para chat |

No se dispone de benchmarks comparativos. La comparación se limita a parámetros y contexto, pero el fine-tune no documenta su ventana de contexto ni su licencia.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño y entrenado con un dataset no documentado, puede presentar sesgos lingüísticos o culturales, y alucinaciones frecuentes, especialmente en tareas de razonamiento.
- Licencia incierta: la model card indica "licence: license" sin especificar términos. Esto impide su uso comercial sin aclaración legal.
- Idioma no confirmado: aunque el nombre sugiere feroés, no hay documentación sobre los idiomas realmente soportados tras el fine-tune.
- Contexto no verificado: no se confirma si la ventana de 128K del modelo base se mantiene; podría haberse reducido durante el entrenamiento.
- Calidad no evaluada: al no haber benchmarks ni evaluaciones humanas, no se puede garantizar la utilidad del modelo en producción.
- Naturaleza experimental: es un experimento (experiment5) y puede contener artefactos de entrenamiento o sobreajuste al dataset específico.

## Enlaces

- [HuggingFace - V4ldeLund/gemma-3-1b-pt-faroese-experiment5](https://huggingface.co/V4ldeLund/gemma-3-1b-pt-faroese-experiment5)
- [Modelo base - google/gemma-3-1b-pt](https://huggingface.co/google/gemma-3-1b-pt)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/v4lde-danmarks-tekniske-universitet-dtu/faroese-icelandic-sft/runs/nfn18wd5)
- [Página de Gemma 3 en Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
