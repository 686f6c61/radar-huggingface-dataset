# xl-24/gemma4-26b-atc-finetune-32-64

## Resumen

`xl-24/gemma4-26b-atc-finetune-32-64` es un ajuste fino (finetune) del modelo base `unsloth/gemma-4-26B-A4B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo de generación de texto derivado de la familia Gemma 4 de Google, en su variante de 26B de parámetros totales con arquitectura Mixture-of-Experts (MoE) de aproximadamente 4B de parámetros activos, según se deduce del sufijo "A4B" del identificador del modelo base. El ajuste se ha realizado empleando Unsloth y TRL, herramientas orientadas a acelerar y abaratar el entrenamiento de modelos grandes.

La información pública disponible es muy limitada: la model card es la plantilla automática generada por Unsloth y no documenta el conjunto de datos de entrenamiento, el objetivo del ajuste ni los hiperparámetros empleados. El sufijo "atc-finetune-32-64" sugiere un ajuste orientado a una tarea concreta (posiblemente relacionada con control de tráfico aéreo, "ATC", o con un rango de longitudes de 32 a 64), pero no hay confirmación oficial en la información proporcionada.

El modelo es relevante principalmente como ejemplo de flujo de trabajo de ajuste fino eficiente sobre un MoE de gran tamaño, y por su licencia Apache 2.0 heredada del modelo base, que facilita su uso comercial. No obstante, la ausencia de benchmarks, de documentación del dataset y de evaluación publicada limita seriamente su adopción en producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), derivada de Gemma 4 (según el identificador del modelo base) |
| Parametros totales | 26B (según el identificador del modelo base) |
| Parametros activos | aproximadamente 4B (según el sufijo "A4B" del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-26B-A4B-it`, que pertenece a la familia Gemma 4 de Google en configuración MoE con 26B de parámetros totales y aproximadamente 4B activos por token. La arquitectura subyacente es, por tanto, un transformer con capas de expertos dispersos, aunque la información proporcionada no detalla el número de expertos, la estrategia de enrutamiento ni la dimensión de las capas.

El entrenamiento del ajuste se realizó con Unsloth (que el autor declara como "2x faster") y con TRL, la librería de Hugging Face para fine-tuning con técnicas como SFT o DPO. No se especifica el número de tokens de entrenamiento, la composición del dataset, si se aplicó RLHF/DPO adicional ni los hiperparámetros (learning rate, epochs, LoRA frente a full fine-tuning). El tamaño del repositorio (4,1 GB) es notablemente inferior al que cabría esperar de un modelo de 26B en precisión completa o bf16, lo que sugiere que podría tratarse de un adaptador LoRA o de pesos cuantizados, pero este dato no se confirma en la información disponible.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 4.
- Razonamiento y respuesta a instrucciones conversacionales (el modelo base es una variante "it", es decir, instruction-tuned).
- Capacidad de ajuste específico para la tarea objetivo del finetune, no documentada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Ajuste fino especializado sobre un MoE de 26B: el modelo sirve como referencia para equipos que quieran replicar un pipeline de fine-tuning con Unsloth y TRL sobre Gemma 4, aprovechando la eficiencia de un MoE con solo ~4B parámetros activos por token.
- Prototipado de asistentes de dominio vertical: si el ajuste "atc" corresponde a control de tráfico aéreo u otro dominio técnico, podría emplearse como base para un asistente especializado, siempre que se valide con datos propios dada la falta de benchmarks.
- Generación de texto en inglés en entornos con licencia permisiva: al heredar Apache 2.0, puede integrarse en productos comerciales sin las restricciones de otras licencias de modelos abiertos.
- Investigación sobre eficiencia de inferencia MoE: útil para medir latencia y throughput de un MoE de 26B/4B activos en hardware consumer o de datacenter, comparándolo con densos de tamaño similar.
- Base para nuevos ajustes incrementales: al ser un checkpoint intermedio, puede servir como punto de partida para fine-tunes posteriores con datasets propios.
- Evaluación comparativa de pipelines de fine-tuning: permite contrastar resultados de Unsloth frente a otros frameworks (Axolotl, TRL estándar) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un MoE de 26B totales y ~4B activos, en bf16 se requerirían del orden de 50-55 GB de VRAM para pesos completos; en cuantización de 8 bits, ~26 GB; en 4 bits, ~13-15 GB. Estas cifras son estimaciones y no están confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar A100 80GB, H100 80GB o configuraciones multi-GPU para bf16; una RTX 4090 (24 GB) podría alojar el modelo solo en cuantizaciones agresivas.
- ¿Cabe en GPU consumer? No confirmado. Probablemente solo en cuantizaciones de 4 bits en GPUs con 16-24 GB, sujeto a validación.
- Opciones de despliegue: el repo incluye la etiqueta `text-generation-inference` y `transformers`, por lo que TGI y transformers son compatibles. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Idiomas | Benchmark |
|---|---|---|---|---|---|---|
| xl-24/gemma4-26b-atc-finetune-32-64 | 26B | ~4B | no disponible | Apache 2.0 | en | no disponible |
| unsloth/gemma-4-26B-A4B-it (base) | 26B | ~4B | no disponible | Apache 2.0 (según repo derivado) | en | no disponible |
| Gemma 3 27B IT (referencia de familia anterior) | 27B | denso | 128K (según documentación pública de Gemma 3) | Gemma license | multilingüe | no aplica a este ajuste |
| Mixtral 8x7B Instruct (referencia MoE) | 46,7B | ~12,9B | 32K | Apache 2.0 | multilingüe | no aplica a este ajuste |

Nota: los datos de los modelos de referencia se incluyen solo como contexto de categoría; no se dispone de comparaciones directas publicadas para este ajuste.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de documentación del dataset de entrenamiento: no es posible evaluar su rendimiento real frente al modelo base ni frente a alternativas.
- Riesgo de degradación respecto al modelo base: los ajustes finos sin evaluación pueden reducir capacidades generales (olvido catastrófico) o introducir sesgos del dataset específico.
- Idioma: solo se declara inglés; el uso en castellano no está soportado oficialmente.
- Riesgo de alucinación: inherente a los modelos generativos; sin evaluación específica no puede cuantificarse.
- Sesgos: no documentados por el autor; se heredan los del modelo base Gemma 4.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base `unsloth/gemma-4-26B-A4B-it` mantenga efectivamente esa licencia y no imponga términos adicionales de la familia Gemma.
- Contexto: no se especifica la longitud máxima soportada; el uso con prompts largos requiere validación empírica.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- Fecha de creación (2026-11-18) y tamaño del repo (4,1 GB) sugieren que puede tratarse de un adaptador o de pesos parciales; conviene inspeccionar los archivos antes de asumir pesos completos.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-26b-atc-finetune-32-64
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (librería de fine-tuning): https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
