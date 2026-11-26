# zoria-ai/Zoria-BF16

## Resumen

Zoria-BF16 es la entrega en precisión completa (BF16, ~62 GB) del modelo Zoria, un ajuste fino de `google/gemma-4-31B-it` desarrollado por zoria-ai y orientado a tareas de razonamiento y generación de texto e imagen-texto en ucraniano e inglés. Con 31.273.088.876 parámetros, se publica como checkpoint de referencia para quien necesite partir de pesos sin cuantizar, ya sea para reentrenamiento, cuantización propia o despliegue en infraestructura sin soporte de FP8.

El modelo hereda la arquitectura y la ventana de contexto de 256K tokens de Gemma 4, y se distribuye bajo licencia Apache 2.0, la misma del modelo base. Es relevante porque el ecosistema de modelos abiertos con competencia real en ucraniano es reducido, y este checkpoint permite reproducir y auditar el ajuste sin depender de la versión cuantizada.

La model card es explícita: esta variante es un artefacto de pesos, no el punto de entrada recomendado para inferencia. El autor remite a `zoria-ai/Zoria` (FP8, ~33 GB) para uso normal, y advierte de que todas las mediciones reportadas se hicieron sobre ese checkpoint cuantizado, no sobre este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (image-text-to-text), base Gemma 4 |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según la model card; el ejemplo de despliegue usa 32.768) |
| Tipos de cuantizacion | BF16 nativo; el autor recomienda la variante FP8 (~33 GB) para inferencia; no se listan GGUF ni otras |
| Idiomas soportados | ucraniano (uk), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (finetune) del checkpoint `google/gemma-4-31B-it`, por lo que conserva la arquitectura transformer decoder-only de Gemma 4 con capacidades multimodales de entrada imagen-texto. No se dispone de detalles sobre la composición del dataset de ajuste, el número de tokens utilizados, ni si se aplicaron fases de RLHF o DPO; la model card de esta variante remite a la de `zoria-ai/Zoria` para el proceso de entrenamiento, y esa información no está incluida en los datos disponibles.

La innovación técnica documentada aquí es de empaquetado, no de arquitectura: se publican los pesos en BF16 antes de la cuantización a FP8, lo que permite reentrenamiento posterior y cuantizaciones alternativas. El autor indica que el checkpoint BF16 no ha sido el sujeto de las evaluaciones, sino el FP8.

## Capacidades

- Generación de texto conversacional en ucraniano e inglés.
- Razonamiento (etiqueta `reasoning` en el repositorio).
- Procesamiento de entrada imagen-texto, heredado de Gemma 4 (`image-text-to-text`).
- Ventana de contexto de hasta 256K tokens según la model card.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Reentrenamiento y ajuste posterior: al ser pesos BF16 sin cuantizar, es el punto de partida adecuado para fine-tuning con LoRA o ajuste completo en tareas específicas de ucraniano, sin los artefactos de precisión que introduce FP8.
- Cuantización propia: equipos que necesiten formatos no publicados por el autor (GGUF para llama.cpp, AWQ, GPTQ) pueden generar sus propias cuantizaciones a partir de este checkpoint.
- Despliegue en hardware sin soporte FP8: GPUs anteriores a Hopper o aceleradores que no implementan FP8 pueden servir el modelo en BF16 con tensor parallelism sobre varias tarjetas.
- Procesamiento de documentos largos en ucraniano: la ventana de 256K permite resumir, extraer y clasificar contratos, informes o expedientes extensos en un solo paso.
- Análisis de documentos con imagen: al heredar la entrada imagen-texto de Gemma 4, puede extraer información de capturas, formularios escaneados o gráficos combinándolos con texto.
- Auditoría y reproducibilidad de resultados: permite verificar las mediciones publicadas sobre la variante FP8 partiendo de los mismos pesos sin pérdida de precisión.
- Asistencia técnica y atención al cliente en ucraniano: conversaciones multi-turno con contexto largo para mantener el histórico de incidencias dentro de la ventana del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que todas las mediciones del proyecto se realizaron sobre el checkpoint FP8 (`zoria-ai/Zoria`) y remite a esa ficha, cuyos datos no forman parte de la información proporcionada.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 62 GB solo para los pesos en BF16; el autor cifra el requisito en ~62 GB de memoria de vídeo.
- GPU de una sola tarjeta: A100 80 GB o H100 80 GB.
- Configuraciones multi-GPU: varias tarjetas menores con `--tensor-parallel-size 2` u orden superior.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB (RTX 4090) ni de 32 GB en BF16; requeriría cuantización propia a 4-8 bits para aproximarse.
- Despliegue: el autor documenta vLLM (`vllm serve zoria-ai/Zoria-BF16 --max-model-len 32768`). Otros motores (TGI, llama.cpp, Ollama) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zoria-BF16 | 31,3B | 256K | Apache 2.0 | Hugging Face | Finetune de Gemma 4; enfoque ucraniano |
| zoria-ai/Zoria (FP8) | 31,3B | 256K | Apache 2.0 | Hugging Face | Mismo modelo cuantizado a FP8 (~33 GB); checkpoint de referencia para benchmarks |
| google/gemma-4-31B-it | 31B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base; cobertura multilingüe general, sin especialización en ucraniano |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es el checkpoint recomendado para inferencia: el autor indica explícitamente que la variante FP8 es más rápida, ocupa la mitad y es la que respalda los resultados publicados.
- Requisito de memoria elevado: ~62 GB solo en pesos, lo que excluye GPUs de consumo sin cuantización adicional.
- Cobertura lingüística limitada a ucraniano e inglés; el rendimiento en otras lenguas no está documentado.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Gemma 4, hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: no cuantificado; no se han publicado evaluaciones de fiabilidad para este checkpoint.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base Gemma 4 de Google, ya que el finetune los hereda.
- Advertencia de producción: al no haberse evaluado el checkpoint BF16, los resultados de calidad medidos sobre FP8 no son directamente extrapolables sin validación propia.
- Contexto: aunque la model card anuncia 256K, el ejemplo de despliegue del autor limita `--max-model-len` a 32.768; el rendimiento más allá de esa longitud no está verificado.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/zoria-ai/Zoria-BF16
- Variante FP8 recomendada: https://huggingface.co/zoria-ai/Zoria
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Telegram del proyecto: https://t.me/zoria_ai
- GitHub del proyecto: https://github.com/zoria-ua
