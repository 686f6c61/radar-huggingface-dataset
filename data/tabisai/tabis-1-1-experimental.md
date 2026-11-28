# tabisai/tabis-1.1-experimental

## Resumen

TABIS 1.1 0.8B es un ajuste fino experimental del modelo Qwen3.5-0.8B orientado al idioma sajá (sakha, código ISO `sah`), una lengua túrquica hablada en la República de Sajá (Yakutia, Rusia). Lo desarrolla el autor independiente `tabisai` y se publica bajo licencia Apache 2.0. El objetivo es dotar de capacidades conversacionales básicas en sajá a un modelo compacto que pueda ejecutarse localmente sin depender de la nube, cubriendo también el ruso como idioma de soporte.

El modelo parte de la base Qwen3.5-0.8B (752.393.024 parámetros reales en safetensors) y aplica un pipeline de adaptación en dos fases: continuación de preentrenamiento (CPT) sobre un corpus monolingüe en sajá y ajuste supervisado (SFT) sobre diálogos, incluyendo un pequeño conjunto de correcciones humanas. La versión se declara explícitamente como inacabada y experimental: el propio autor advierte de respuestas incoherentes, repeticiones, confusión de personas gramaticales y alucinaciones en datos biográficos e históricos.

Su relevancia es doble: por un lado, demuestra que es viable adaptar un modelo de menos de mil millones de parámetros a una lengua de bajos recursos con recursos modestos (QLoRA 4-bit, contexto de 1024 tokens, una sola época de SFT); por otro, sirve como referencia metodológica para quien quiera replicar el proceso en otras lenguas minorizadas. No obstante, no debe considerarse un modelo listo para producción ni una fuente fiable de datos factuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B); no se detalla la configuración interna en la información disponible |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens durante el entrenamiento; no se especifica la ventana nativa del modelo base |
| Tipos de cuantización | F16, BF16, Q4_K_M (GGUF); base QLoRA NF4 durante el entrenamiento |
| Idiomas soportados | Sajá (`sah`), ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 fusionado) y GGUF (F16, BF16, Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-0.8B, un transformer decoder-only de 752 millones de parámetros. Sobre él se añadieron 110 tokens nuevos al tokenizador para representar texto en sajá, y las filas de embeddings correspondientes se entrenaron junto con el adaptador LoRA. El entrenamiento se estructuró en dos etapas. La primera, CPT (continuación de preentrenamiento), usó el corpus monolingüe `ailabykt/sakha-corpus-mono`: 216.022 documentos y 354.822.906 tokens con EOS en el split de entrenamiento, y 3.298 documentos y 4.805.554 tokens en validación. Se completó una pasada de 57.446 pasos, con interrupciones y reanudaciones desde checkpoints. La pérdida de validación bajó de 4,1013 a 1,6447.

La segunda etapa, SFT, empleó 9.678 diálogos de entrenamiento y 503 de validación: 7.055 registros del conjunto sintético `tabisai/tabis-sakha-dialogues-7500` y 2.623 de candidatos previos, con un split propio distinto del publicado. En la variante "Human sensitivity" se incluyeron siete ejemplos corregidos por humanos en entrenamiento y dos en validación. El método fue QLoRA con base 4-bit, LoRA `r=16`, `alpha=32`, contexto de 1024 tokens, batch 1 con acumulación de gradiente 8, AdamW 8-bit, learning rate `5e-5` para CPT y `2e-5` para SFT. El SFT duró una época y 1.210 pasos, con pérdida de validación de 1,9337 a 1,5661 (train loss 1,6365). No se usó NEFTune. Para la exportación se convirtió la base NF4 a BF16 y se fusionó con el adaptador, generando F16, BF16 y Q4_K_M GGUF; un template corregido elimina el mensaje de sistema vacío.

## Capacidades

- Generación de texto conversacional breve en sajá, con respuestas de estilo coloquial.
- Comprensión y generación en ruso como idioma de soporte.
- Ejecución local completamente offline tras la descarga, sin llamadas a la nube.
- Funcionamiento en LM Studio (GGUF) y en llama.cpp (BF16 verificado en CPU).
- Plantilla de chat con soporte de roles; el template corregido gestiona el mensaje de sistema vacío.
- Modo "thinking" heredado de la familia Qwen3.5, que el autor recomienda desactivar.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Prototipado de asistentes conversacionales en sajá: permite probar interfaces de chat en esta lengua con un modelo que cabe en un portátil, usando la cuantización Q4_K_M (~505 MiB) para iterar rápido sobre prompts y plantillas.
- Investigación en adaptación de lenguas de bajos recursos: sirve como caso de estudio reproducible de un pipeline CPT + SFT con QLoRA sobre un modelo sub-1B, útil para comparar metodologías en publicaciones o trabajos académicos.
- Experimentos de aumento de vocabulario: los 110 tokens añadidos al tokenizador y el entrenamiento de sus embeddings son un ejemplo práctico para estudiar el impacto del tokenizador en lenguas aglutinantes como el sajá.
- Generación de borradores de diálogo para revisión humana: el modelo puede producir respuestas preliminares que un hablante nativo corrija, alimentando así futuras iteraciones del conjunto de datos.
- Evaluación comparativa de cuantizaciones: al ofrecer F16, BF16 y Q4_K_M, permite medir la degradación de calidad entre precisiones en un modelo pequeño y en una lengua concreta.
- Docencia y demostraciones de IA local: su tamaño reducido y su licencia Apache 2.0 lo hacen adecuado para talleres sobre despliegue de LLM en hardware de consumo.
- Pruebas de integración en pipelines de inferencia (llama.cpp, LM Studio) antes de escalar a modelos mayores, validando plantillas de chat y formatos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, YakutEval) en la información disponible. El autor indica explícitamente que la comparación realizada no constituye una evaluación independiente por nativos ni un YakutEval completo, y que parte de las comparaciones previas se hicieron con GigaChat, que también puede equivocarse en sajá. Las únicas métricas publicadas son las pérdidas de entrenamiento:

| Etapa | Loss validación antes | Loss validación después | Notas |
|---|---:|---:|---|
| CPT | 4,1013 | 1,6447 | Última ejecución reanudada; 57.446 pasos |
| SFT (Human sensitivity) | 1,9337 | 1,5661 | Train loss 1,6365; 1 época, 1.210 pasos |

Evolución de la loss de validación en CPT: 1,8482 (paso 10.000), 1,7476 (20.000), 1,6977 (30.000), 1,6696 (40.000), 1,6514 (50.000), 1,6447 (final). En SFT: 1,6610 (250), 1,6135 (500), 1,5876 (750), 1,5711 (1.000), 1,5661 (final).

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M ocupa aproximadamente 505 MiB en disco; F16 y BF16 ocupan alrededor de 1,41 GiB cada uno. La VRAM necesaria en ejecución es del mismo orden más el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer con al menos 2-3 GB de VRAM libre para Q4_K_M; para F16/BF16 se recomienda al menos 4 GB. Modelos como RTX 3060, RTX 4060, RTX 4090 o superiores son más que suficientes. También funciona en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LM Studio (F16 y Q4_K_M verificados en GPU; BF16 verificado en llama.cpp CPU), llama.cpp, y cualquier runtime compatible con GGUF. No se documenta soporte verificado para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| TABIS 1.1 0.8B | 752 M | 1024 (entrenamiento) | sah, ru | Apache 2.0 | Ajuste específico para sajá; experimental |
| Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe (sin sajá específico) | No disponible en la información | Modelo de partida; mayor cobertura general pero sin adaptación a sajá |
| Otros ajustes para lenguas de bajos recursos del mismo tamaño | No disponible | No disponible | No disponible | No disponible | No se dispone de comparativas publicadas en la información |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estos modelos. La comparación se limita a parámetros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Modelo declarado explícitamente como experimental e inacabado por el autor; no apto para producción sin validación adicional.
- Riesgo alto de alucinación en datos biográficos e históricos: el autor documenta que el modelo inventa hechos con seguridad. En su prueba no identificó Ysyakh como la gran festividad veraniega sajá.
- Respuestas incoherentes, evasión de la pregunta, repeticiones y confusión de personas gramaticales observadas por el autor.
- Rendimiento deficiente en matemáticas y tareas lógicas.
- Contexto de entrenamiento limitado a 1024 tokens, lo que restringe conversaciones largas y documentos extensos.
- Evaluación insuficiente: no hay evaluación independiente por hablantes nativos ni YakutEval completo; parte de las comparaciones se hicieron con GigaChat, que también puede errar en sajá.
- Los siete ejemplos corregidos por humanos en entrenamiento no implican que el conjunto de datos esté revisado por personas.
- Posibles diferencias de comportamiento entre el sitio web, los GGUF y las distintas cuantizaciones.
- El modo "thinking" debe desactivarse según recomendación del autor; dejarlo activo puede degradar la experiencia.
- Licencia Apache 2.0 permite uso comercial, pero la calidad factual no está garantizada; cualquier despliegue comercial exigiría verificación humana y probablemente un ajuste adicional.
- No se documentan sesgos específicos más allá de los derivados del corpus y del modelo base; no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabisai/tabis-1.1-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset CPT: https://huggingface.co/datasets/ailabykt/sakha-corpus-mono
- Dataset SFT: https://huggingface.co/datasets/tabisai/tabis-sakha-dialogues-7500
- Métricas CPT: `evaluation/cpt_training_metrics_resumed.json` (en el repositorio del modelo)
- Métricas SFT: `evaluation/sft_training_metrics.json` (en el repositorio del modelo)
