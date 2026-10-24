# SwetieePawsss/DUET_ft_models

## Resumen

`SwetieePawsss/DUET_ft_models` es un repositorio de HuggingFace (48,4 GB) que agrupa checkpoints afinados de tres modelos instruct: `gemma-7b-it`, `Llama-3.1-8B-Instruct` y `Qwen2.5-7B-Instruct`. Segun la propia model card, el repositorio se conserva como referencia de la version v1.0 y los modelos han pasado a repositorios individuales dentro de la coleccion "DUET: Anatomy of Unlearning". Alli se listan tanto fine-tunes completos como variantes LoRA fusionadas y modelos denominados "AdaPop".

El interes del repositorio no esta en un modelo base nuevo, sino en el procedimiento de ajuste aplicado sobre arquitecturas conocidas: el nombre de la coleccion y la estructura de los artefactos apuntan a un trabajo de *machine unlearning* (desaprendizaje), es decir, eliminar del modelo el conocimiento de un subconjunto de datos manteniendo el rendimiento general. El autor no publica en esta ficha ni el dataset, ni el numero de tokens, ni hiperparametros, ni resultados de evaluacion.

La relevancia practica es doble: por un lado, sirve como material reproducible para investigadores que comparan tecnicas de olvido (LoRA frente a fine-tune completo frente a optimizadores tipo AdaPop); por otro, es un caso de estudio de gobernanza de modelos, ya que el olvido selectivo es la base tecnica de escenarios de cumplimiento del derecho al olvido. El repositorio no registra descargas ni "likes" y no incluye model card tecnica detallada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de los modelos base; no documentada en el repositorio |
| Parametros totales | ~7-8 mil millones por checkpoint (tres checkpoints: 7B, 8B y 7B) |
| Parametros activos | No aplica: modelos densos, no MoE |
| Longitud de contexto | No disponible en el repositorio; se hereda del modelo base correspondiente |
| Tipos de cuantizacion | No se publican cuantizaciones; solo pesos en `safetensors` en la precision del fine-tune |
| Idiomas soportados | No disponible |
| Licencia | `other` (cada checkpoint hereda ademas la licencia de su modelo base) |
| Formato de pesos | `safetensors` (adaptadores LoRA ya fusionados en las variantes LoRA-merged) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la composicion del dataset, el volumen de tokens, el regimen de entrenamiento (RLHF, DPO, SFT) ni los hiperparametros. Lo que si se deduce de los artefactos es la metodologia: se parte de tres modelos instruct densos de ~7-8B, se aplica un ajuste adicional y se distribuyen dos variantes por modelo base: una con adaptadores LoRA fusionados en los pesos (de modo que la inferencia no requiere PEFT) y otra con fine-tune completo. La coleccion menciona ademas modelos "AdaPop", lo que sugiere el uso de un optimizador especifico durante el ajuste, aunque el repositorio no aporta detalles tecnicos al respecto.

La etiqueta `tensorboard` indica que se registraron curvas de entrenamiento, pero los eventos no se han publicado en esta ficha ni se ha incluido una tabla de metricas. El prefijo "DUET" y el subtitulo "Anatomy of Unlearning" sitúan el trabajo en la linea de desaprendizaje selectivo: el objetivo seria reducir la probabilidad de que el modelo reproduzca un conjunto de datos concreto sin degradar tareas generales. Al no publicarse la evaluacion, no es posible verificar si se produce olvido efectivo ni cuanto coste de rendimiento general implica.

## Capacidades

- Generacion de texto e instrucciones en los tres checkpoints, heredadas de modelos base ya alineados para chat.
- Razonamiento y matematicas basicas, en el nivel de los modelos base (sin datos de evaluacion en este repositorio).
- Generacion de codigo, especialmente en `Llama-3.1-8B-Instruct` y `Qwen2.5-7B-Instruct`, que incluyen entrenamiento especifico para codigo.
- Capacidad multilingue no documentada en esta ficha; depende del modelo base y puede verse alterada por el ajuste.
- Soporte de tool calling / function calling: no verificado en estos checkpoints; en los modelos base es parcial y dependiente de la plantilla de chat.
- Comportamiento como modelo "olvidado": se espera que la variante DUET reduzca la emision de los datos objetivo, pero no hay evidencia publicada que lo confirme.
- No se documentan capacidades de vision, audio ni modos de razonamiento explicito (thinking).

## Casos de uso

- **Auditoria de desaprendizaje**: ejecutar baterias de *probing* sobre los tres checkpoints para medir la tasa de reproduccion del conjunto supuestamente olvidado frente a los modelos base, usando perplexity y extraccion de completaciones. Es el uso principal del repositorio, ya que permite comparar tres arquitecturas con el mismo procedimiento.
- **Cumplimiento del derecho al olvido (RGPD)**: servir como prueba de concepto tecnica para justificar ante un DPO o un cliente que un modelo derivado ya no reproduce registros personales concretos, documentando la comparacion antes/despues.
- **Investigacion de olvido catastrofico**: medir la degradacion en tareas generales (MMLU, GSM8K, HumanEval) tras el ajuste de olvido, comparando la variante LoRA fusionada con el fine-tune completo para cuantificar el coste de cada estrategia.
- **Comparativa de optimizadores y tecnicas de ajuste**: los checkpoints permiten aislar el efecto de LoRA frente a fine-tune completo frente a la variante AdaPop sobre el mismo modelo base, con control de variables.
- **Red teaming de privacidad**: usar los modelos como sujeto de ataques de extraccion de memorizacion (prompting adversario, *prefix injection*) para validar si el olvido resiste ataques simples; los resultados son directamente aplicables a politicas de publicacion de modelos.
- **Filtrado de contenido y seguridad**: evaluar si el ajuste reduce la generacion de contenido danino o de datos sensibles, y si esa reduccion es selectiva o afecta a la utilidad general del modelo.
- **Docencia y reproducibilidad**: al estar el repositorio congelado como v1.0, sirve como referencia estable en cursos y articulos, sin riesgo de que los pesos cambien bajo los mismos identificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio incluye la etiqueta `tensorboard`, lo que sugiere la existencia de registros de entrenamiento, pero no se han publicado curvas, metricas ni comparaciones con los modelos base. No se deben asumir valores de MMLU, HumanEval o GSM8K para estos checkpoints.

## Requisitos de hardware

- Peso en disco: 48,4 GB para el repositorio completo (tres checkpoints de ~15-16 GB en fp16/bf16, mas ficheros auxiliares).
- VRAM en fp16/bf16: ~16 GB solo para pesos en un modelo de 7-8B; con cache KV y overhead, entre 18 y 24 GB para contextos moderados.
- VRAM en 8 bits: ~8-9 GB de pesos; viable en GPUs de 16 GB.
- VRAM en 4 bits: ~5-6 GB de pesos; viable en GPUs de 12 GB, con perdida de calidad no evaluada en este repositorio.
- GPU recomendadas: A100 40/80 GB y H100 para inferencia concurrente en fp16; RTX 4090 o RTX 3090 (24 GB) para un unico servicio en fp16 con contexto limitado; L4 o RTX 4080 (16 GB) en 8 bits.
- Cabe en GPU de consumo: si, en 4 bits de forma holgada (RTX 3060 12 GB, RTX 4060 Ti 16 GB) y en fp16 de forma ajustada en RTX 4090/3090.
- Despliegue: `transformers` directamente (los LoRA-merged no requieren PEFT), vLLM, TGI o SGLang para servir en produccion. `llama.cpp` y Ollama requieren conversion previa a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `gemma-7b-it` (base) | ~7B | No documentado en este repo | Gemma Terms of Use | HuggingFace |
| `gemma-7b-it-DUET-LoRA-merged` | ~7B | No documentado | `other` | HuggingFace (repo individual) |
| `Llama-3.1-8B-Instruct` (base) | ~8B | No documentado en este repo | Llama 3.1 Community License | HuggingFace |
| `Llama-3.1-8B-Instruct-DUET-LoRA-merged` | ~8B | No documentado | `other` | HuggingFace (repo individual) |
| `Qwen2.5-7B-Instruct` (base) | ~7B | No documentado en este repo | Qwen License | HuggingFace |
| `Qwen2.5-7B-Instruct-DUET-LoRA-merged` | ~7B | No documentado | `other` | HuggingFace (repo individual) |

No se dispone de datos de rendimiento para comparar los checkpoints DUET con sus bases ni con otras propuestas de desaprendizaje; la comparacion queda limitada a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: sin dataset, sin hiperparametros y sin evaluacion, no es posible reproducir el ajuste ni verificar sus afirmaciones.
- El olvido puede ser superficial: sin resultados publicados, un ataque de *prompting* adversario podria recuperar parte del conocimiento supuestamente eliminado.
- Riesgo de olvido catastrofico no cuantificado: el ajuste puede degradar capacidades generales sin que existan metricas que lo documenten.
- Sesgos heredados: cualquier sesgo de genero, etnia o idioma de los modelos base persiste y puede verse alterado de forma no controlada por el fine-tune.
- Alucinacion: se mantiene el comportamiento de los modelos base, sin mitigaciones adicionales documentadas.
- Licencia `other`: las condiciones exactas no estan detalladas; se debe consultar la licencia del modelo base de cada checkpoint antes de cualquier uso comercial, y la de los pesos derivados con el autor.
- Idiomas no declarados: no hay garantia de cobertura multilingue ni de que el ajuste se haya realizado en castellano.
- Repositorio congelado como v1.0: no recibira actualizaciones; los modelos activos estan en la coleccion, lo que obliga a revisar cada repositorio individual.
- Repositorio pesado (48,4 GB) con tres checkpoints completos, lo que complica su descarga y almacenamiento en entornos de investigacion limitados.
- Sin cuantizaciones oficiales: desplegar en GPUs pequenas exige convertir los pesos por cuenta propia, con riesgo de degradacion no medida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SwetieePawsss/DUET_ft_models
- Coleccion "DUET: Anatomy of Unlearning": https://huggingface.co/collections/SwetieePawsss/duet-anatomy-of-unlearning-6adbb5695dfb6f3e25293251
- `gemma-7b-it-DUET-LoRA-merged`: https://huggingface.co/SwetieePawsss/gemma-7b-it-DUET-LoRA-merged
- `Llama-3.1-8B-Instruct-DUET-LoRA-merged`: https://huggingface.co/SwetieePawsss/Llama-3.1-8B-Instruct-DUET-LoRA-merged
- `Qwen2.5-7B-Instruct-DUET-LoRA-merged`: https://huggingface.co/SwetieePawsss/Qwen2.5-7B-Instruct-DUET-LoRA-merged
- Modelo base `gemma-7b-it`: https://huggingface.co/google/gemma-7b-it
- Modelo base `Llama-3.1-8B-Instruct`: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Modelo base `Qwen2.5-7B-Instruct`: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
