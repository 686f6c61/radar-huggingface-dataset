# yushengsu/Qwen3-8B-5layer-MoE-8E1A-FFN12288-v1

## Resumen

Qwen3-8B DSpark drafter es un modelo borrador (*draft model*) diseñado específicamente para decodificación especulativa sobre el modelo base Qwen/Qwen3-8B. Lo desarrolla el usuario yushengsu y se entrena con SpecForge en su variante DSpark. Su función no es responder al usuario final, sino proponer tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, reduciendo la latencia de generación en inferencia autoregresiva.

El modelo consta de 5 capas transformer con atención de 32 cabezas de consulta y 8 de clave/valor de dimensión 128, normalización q/k y un cabezal Markov de rango 256 con bloques de 16 tokens. Cada FFN se sustituye por una capa MoE de 8 expertos de anchura 12288 con top-1 (sin experto compartido), lo que da 6,41 mil millones de parámetros totales y 1,13 mil millones activos, manteniendo el mismo coste FLOPs que un FFN denso de borrador.

Es relevante porque permite acelerar despliegues de Qwen3-8B sin modificar el modelo objetivo, con una licencia Apache 2.0 y un formato compatible con el ecosistema SpecForge. El entrenamiento está en curso (4 épocas previstas) y los checkpoints se publican por época.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con FFN tipo MoE (8 expertos, top-1) y cabezal Markov |
| Parametros totales | 6,41 mil millones |
| Parametros activos | 1,13 mil millones |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (config.json + model.safetensors + tokenizer) |

## Arquitectura y entrenamiento

El modelo es un borrador de 5 capas con atención multi-cabeza de 32 cabezas de consulta y 8 de clave/valor de dimensión 128, con normalización q/k. Cada capa FFN es una MoE de 8 expertos de anchura 12288 con enrutamiento top-1 y sin experto compartido, lo que mantiene 1,13 mil millones de parámetros activos y un coste FLOPs equivalente al de un FFN denso de borrador. Incluye un proyector fc de 20480 a 4096 sobre las capas objetivo 1, 9, 17, 25 y 33 del modelo Qwen3-8B, un cabezal Markov de rango 256 y bloques de 16 tokens para la verificación especulativa.

El entrenamiento se realiza con SpecForge (variante DSpark) sobre prompts de tipo perfectblend regen con temperatura 0 y sin modo *think*, con contexto de 8192 tokens y plantilla qwen3-instruct. Se usa learning rate 6e-4 con decaimiento coseno y 4 % de warm-up, 132 muestras por paso de optimizador y 10 764 pasos por época, con Liger RMSNorm y dos nodos GB300 de 4x. El proceso está en curso y contempla 4 épocas; los checkpoints se publican como `1ep/`, `2ep/`, `3ep/` y `4ep/` al finalizar cada una.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3-8B.
- Verificación acelerada mediante cabezal Markov de rango 256 y bloques de 16 tokens.
- Proyección de características desde las capas 1, 9, 17, 25 y 33 del modelo objetivo.
- Compatibilidad con el ecosistema SpecForge y su integración en pipelines de inferencia.
- No es un modelo conversacional: no se ha entrenado para responder directamente a prompts de usuario.
- Soporte de tool calling, agentes o visión: no disponible (no es su propósito).
- Capacidades multilingües: no disponibles; el entrenamiento usa plantilla qwen3-instruct sobre prompts en inglés.

## Casos de uso

- Aceleración de inferencia de Qwen3-8B en producción: se usa como borrador que propone tokens y el modelo objetivo los verifica, reduciendo la latencia por token en despliegues con vLLM o TGI que soporten decodificación especulativa.
- Servicio de chat de alto tráfico: al disminuir el coste por token generado, permite atender más peticiones concurrentes con el mismo hardware manteniendo la calidad del modelo grande.
- Generación de código en pipelines CI/CD: la decodificación especulativa reduce el tiempo de respuesta en tareas de autocompletado y generación de parches, donde la latencia es crítica.
- Asistentes embebidos en IDE: al ser un borrador ligero (1,13 B activos), puede combinarse con Qwen3-8B para ofrecer autocompletado con latencia baja en entornos de desarrollo.
- Investigación en decodificación especulativa: sirve como referencia reproducible para estudiar el impacto de arquitecturas MoE en la tasa de aceptación del borrador.
- Evaluación de técnicas de entrenamiento (DSpark, SpecForge): permite comparar configuraciones de proyector, cabezal Markov y tamaño de bloque en la aceleración efectiva.
- Despliegue en clústeres con GB300: validación de pipelines de entrenamiento distribuido para borradores especulativos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tener 6,41 B parámetros totales, en FP16 requeriría aproximadamente 13 GB, y en cuantización de 8 bits unos 6,5 GB, aunque no se han publicado mediciones.
- GPU recomendadas: no disponible; el entrenamiento se realizó en nodos GB300 de 4x, pero no se especifican requisitos de inferencia.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño podría caber en RTX 4090 (24 GB) en FP16, pero no hay datos oficiales.
- Opciones de despliegue: integración con SpecForge; compatibilidad con vLLM, llama.cpp, Ollama o TGI no confirmada.
- Latencia y throughput: no disponibles; dependen de la tasa de aceptación del borrador frente a Qwen3-8B, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-8B DSpark drafter (este) | 6,41 B totales / 1,13 B activos | 8192 | Apache 2.0 | Hugging Face, checkpoints por época |
| Qwen/Qwen3-8B (modelo objetivo) | 8 B | no disponible en la información | Apache 2.0 | Hugging Face |
| Borradores densos convencionales para decodificación especulativa | no disponible | no disponible | variable | variable |

No se dispone de datos de rendimiento comparado con otros borradores especulativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo en entrenamiento: solo se publican checkpoints al finalizar cada época; el estado actual puede ser incompleto o no convergido.
- No es un modelo de propósito general: no debe usarse para responder directamente a usuarios ni para tareas generativas sin el modelo objetivo.
- Sesgos conocidos: no disponibles; al entrenarse sobre prompts de perfectblend regen, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: no aplica directamente al ser un borrador, pero una baja tasa de aceptación degradaría la aceleración esperada.
- Limitaciones de contexto: el contexto de entrenamiento es de 8192 tokens; no se ha validado para secuencias más largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3-8B y de los datos de entrenamiento.
- Caveat para producción: requiere un runtime que soporte decodificación especulativa con proyector multi-capa y cabezal Markov; la integración con frameworks estándar no está confirmada.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-8E1A-FFN12288-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Código SpecForge (PR #23): https://github.com/yushengsu-thu/SpecForge/pull/23
