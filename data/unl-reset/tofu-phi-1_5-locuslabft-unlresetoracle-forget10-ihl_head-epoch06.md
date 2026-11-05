# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch06

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch06` es un checkpoint de investigación derivado de Phi-1.5, un transformer denso de 1.418 millones de parámetros (1,3B) desarrollado originalmente por Microsoft Research. Lo publica el colectivo `unl-reset`, aparentemente vinculado a experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), una metodología académica para evaluar si un modelo puede "olvidar" selectivamente datos de entrenamiento sin degradar el resto de su conocimiento.

El modelo no es un lanzamiento de propósito general, sino un artefacto experimental: se ha entrenado con una combinación de *token-level IHL* (probablemente una variante de *influence-based* o *information-theoretic head loss*) sobre el conjunto "forget" y entropía cruzada estándar sobre el conjunto "retain", con los embeddings de entrada y la LM head reinicializados desde el Phi-1.5 original y el resto de pesos heredados de `locuslab/tofu_ft_phi-1.5`. Corresponde a la epoch 6 de 20 de un pipeline de desaprendizaje.

Su relevancia es por tanto metodológica: sirve para estudiar técnicas de borrado selectivo de conocimiento, cumplimiento del derecho al olvido en modelos, y mitigación de memorización. No está pensado para despliegue en producción ni para tareas generativas generales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5, decoder-only) |
| Parametros totales | 1.418.270.720 (1,3B aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 original: 2048 tokens; no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1,3B de parámetros, entrenado originalmente por Microsoft con datos de "libro de texto" sintéticos y filtrados. Este checkpoint concreto no modifica la topología: reinicializa los embeddings de entrada y la LM head desde `microsoft/phi-1_5`, y conserva el resto de pesos del modelo ajustado `locuslab/tofu_ft_phi-1.5` (que a su vez es un fine-tuning de Phi-1.5 sobre el dataset TOFU).

El entrenamiento de este checkpoint aplica una pérdida compuesta: *token IHL* sobre el conjunto "forget" (los datos que se pretende borrar) más un término de entropía cruzada con peso 1.0 sobre el conjunto "retain" (los datos que deben preservarse). El objetivo es doble: minimizar la influencia de los datos olvidados y mantener el rendimiento en el resto. El checkpoint corresponde a la epoch 6 de un ciclo de 20, lo que sugiere que no es el estado final del proceso y que su comportamiento puede diferir del checkpoint convergido.

El repositorio incluye un archivo `ihl_manifest.json` con metadatos del proceso, y el tag `custom_code` indica que la carga requiere código personalizado del autor (probablemente para la inicialización o para la lógica de la cabeza IHL). No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado ni hiperparámetros como learning rate o batch size.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5, aunque potencialmente degradada por el proceso de desaprendizaje.
- Razonamiento básico y respuesta a preguntas de conocimiento general, en la medida en que el fine-tuning sobre TOFU y el borrado selectivo lo permitan.
- Generación de código sencillo (Phi-1.5 fue entrenado con foco en código Python), si bien este checkpoint no está optimizado para ello.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (`language: en`).
- No dispone de visión, audio ni modo "thinking" explícito.
- Capacidad principal real: servir como objeto de estudio de desaprendizaje, no como asistente.

## Casos de uso

- Investigación en *machine unlearning*: comparar el comportamiento de este checkpoint (epoch 6) frente a otros checkpoints del mismo pipeline para trazar la curva de olvido/retención a lo largo del entrenamiento.
- Evaluación de cumplimiento del derecho al olvido: medir si el modelo deja de reproducir información del conjunto "forget" en escenarios controlados de extracción.
- Análisis de memorización: usar el modelo como caso de estudio para técnicas de *membership inference* y *extraction attacks* sobre datos de entrenamiento.
- Reproducibilidad académica: servir de referencia para replicar experimentos de TOFU con la variante IHL + reset de embeddings y LM head.
- Estudio de degradación colateral: cuantificar cuánto conocimiento general se pierde al aplicar pérdidas de olvido agresivas sobre un modelo pequeño.
- Docencia y formación: ilustrar en cursos de seguridad y privacidad de IA cómo se construye y evalúa un checkpoint desaprendido, con un modelo lo bastante pequeño para caber en hardware de laboratorio.
- Baseline para comparativas: punto de comparación frente a métodos alternativos de desaprendizaje (gradient ascent, KL regularization, etc.) en el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,8-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 3070, RTX 4070) es suficiente para inferencia en FP16; para entrenamiento o evaluación intensiva se recomienda A100 o H100.
- Cabe holgadamente en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`), vLLM y TGI si el código personalizado es compatible, llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,3B, en una RTX 4090 se espera un throughput de decenas a centenares de tokens por segundo, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| Este checkpoint (TOFU forget10, IHL head, epoch 6) | 1,3B | no disponible | apache-2.0 | Desaprendizaje selectivo (investigación) |
| microsoft/phi-1_5 | 1,3B | 2048 tokens | MIT (según model card original) | Generación de texto y código |
| locuslab/tofu_ft_phi-1.5 | 1,3B | 2048 tokens (heredado) | no disponible en esta ficha | Fine-tuning sobre TOFU, base de este checkpoint |
| Otros checkpoints TOFU sobre Phi-1.5 | 1,3B | 2048 tokens (heredado) | variable | Desaprendizaje con métodos alternativos |

La comparación relevante es con el modelo base `locuslab/tofu_ft_phi-1.5` (del que hereda todos los pesos excepto embeddings y LM head) y con el Phi-1.5 original. Frente a ellos, este checkpoint debería mostrar menor retención de los datos "forget" a costa de cierta degradación en "retain". No se dispone de métricas publicadas para cuantificar esa diferencia.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para tareas generativas generales.
- Riesgo de alucinación elevado: el proceso de desaprendizaje puede degradar la coherencia y aumentar la generación de contenido inventado.
- Sesgos: hereda los sesgos de Phi-1.5 y del dataset TOFU; no se documenta ninguna mitigación.
- Limitación de idioma: solo inglés (`language: en`); no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: no se confirma la longitud de contexto efectiva tras el proceso de fine-tuning; el valor de Phi-1.5 (2048) es una referencia, no un dato verificado para este checkpoint.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el modelo base Phi-1.5 tiene su propia licencia (MIT según su model card original) y el fine-tuning intermedio `locuslab/tofu_ft_phi-1.5` no declara licencia en la información disponible; conviene verificar la cadena completa antes de cualquier uso comercial.
- Requiere `trust_remote_code=True`: el tag `custom_code` implica ejecutar código del autor al cargar el modelo, lo que supone un riesgo de seguridad si no se audita.
- Checkpoint intermedio (epoch 6 de 20): su comportamiento puede no representar el estado final del pipeline de desaprendizaje.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- No apto para aplicaciones sensibles (salud, legal, financiero) sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch06
- Modelo base del fine-tuning: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Phi-1.5 original: https://huggingface.co/microsoft/phi-1_5
- Paper de TOFU (referencia del benchmark, no enlazado en la información proporcionada): no disponible
- Repositorio del autor `unl-reset`: no disponible
- Paper o blog del método IHL: no disponible
