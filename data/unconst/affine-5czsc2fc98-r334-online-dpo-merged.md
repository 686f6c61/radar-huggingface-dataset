# unconst/Affine-5czsc2fc98-r334-online-dpo-merged

## Resumen

Affine-5czsc2fc98-r334-online-dpo-merged es un modelo de lenguaje de la serie Affine desarrollado por el usuario unconst, construido a partir del modelo base marsplan0624/affine-5gedzafcvg-queen. Se trata de un fine-tuning mediante LoRA fusionada con optimización Online-DPO, orientado a mejorar el razonamiento y la calidad de las respuestas en tareas conversacionales y de generación de texto. El modelo presenta una arquitectura MoE (Mixture of Experts) basada en Qwen3.5, con 35.107.181.936 parámetros totales, y soporta entrada multimodal de imagen y texto (image-text-to-text), lo que lo hace adecuado para aplicaciones que combinan visión y lenguaje.

La relevancia de este modelo radica en su enfoque de entrenamiento con DPO en línea, una técnica que ajusta el modelo mediante preferencias humanas durante el proceso de entrenamiento, y en su integración con el ecosistema de transformers. Aunque no se dispone de información pública sobre licencia, idiomas o contexto, su tamaño y arquitectura lo sitúan en la categoría de modelos de gran escala con capacidades avanzadas de razonamiento. El repositorio tiene 70.2 GB y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, según los tags de HuggingFace. Esta arquitectura permite activar solo un subconjunto de parámetros durante la inferencia, lo que reduce el coste computacional en comparación con un modelo denso del mismo tamaño total. Además, el tag `image-text-to-text` indica que el modelo está diseñado para procesar tanto imágenes como texto, lo que sugiere un codificador visual integrado en la arquitectura.

El entrenamiento se realizó mediante LoRA (Low-Rank Adaptation) fusionada, con un proceso de Online-DPO (Direct Preference Optimization) en línea. Los hiperparámetros reportados en la model card son: β=0.1, α=32, r=16, G=4, lr=5e-6, temp=1.2, max_steps=300 y FORCE_PREFIX. Este enfoque ajusta el modelo a partir de preferencias humanas durante el entrenamiento, mejorando la alineación con las expectativas del usuario. El modelo base es `marsplan0624/affine-5gedzafcvg-queen`, y el proceso de fusión LoRA se aplicó sobre una versión específica de este modelo (commit 556d02a2).

## Capacidades

- Generación de texto y conversación: el modelo está diseñado para tareas de generación de texto y diálogo, con pipeline `text-generation`.
- Razonamiento avanzado: el tag `reason-v3` sugiere capacidades de razonamiento mejoradas, probablemente orientadas a problemas de lógica y matemáticas.
- Multimodalidad: soporta entrada de imagen y texto (image-text-to-text), lo que permite procesar imágenes junto con instrucciones textuales.
- Fine-tuning con DPO: el entrenamiento con Online-DPO mejora la calidad de las respuestas en términos de preferencia humana.
- Compatibilidad con transformers: se integra con la librería transformers, facilitando su uso en pipelines estándar.
- No se dispone de información sobre tool calling, agentes o capacidades multilingües específicas.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede gestionar diálogos que incluyan imágenes, por ejemplo, para responder preguntas sobre fotografías o documentos escaneados, aprovechando su capacidad image-text-to-text.
- Análisis de documentos visuales: en entornos empresariales, puede extraer información de facturas, formularios o gráficos combinando texto e imagen, útil para automatizar procesos de revisión.
- Generación de contenido asistida: puede redactar informes, correos o artículos a partir de instrucciones textuales, con un razonamiento mejorado gracias al entrenamiento DPO.
- Soporte técnico automatizado: al ser un modelo conversacional, puede atender consultas de usuarios en chatbots, manteniendo un tono coherente y respuestas alineadas con preferencias humanas.
- Razonamiento lógico y matemático: gracias al tag `reason-v3`, puede utilizarse en aplicaciones educativas o de resolución de problemas que requieran pasos de razonamiento explícitos.
- Prototipado de aplicaciones de IA: al estar disponible en formato safetensors y ser compatible con transformers, es adecuado para experimentación y desarrollo de demos en investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. La model card incluye una métrica interna de comparación con el modelo base: "Local n80 vs marsplan: margin=+0.01182 SE=0.00484 z=2.445 clears max(2·SE, δ=0.002); median_len_z=217; B pass=0.468". Este dato sugiere una mejora estadísticamente significativa en una evaluación local, pero no es un benchmark público reproducible.

## Requisitos de hardware

- VRAM estimada: al tener 35.107.181.936 parámetros, en precisión FP16 se necesitarían aproximadamente 70 GB de VRAM (el tamaño del repositorio es 70.2 GB). Con cuantización a 8 bits se reduciría a ~35 GB, y a 4 bits a ~18 GB, aunque no se confirma la disponibilidad de estas cuantizaciones.
- GPU recomendadas: para inferencia en FP16 se requieren GPUs de alta gama como NVIDIA A100 80GB, H100 80GB o similares. Con cuantización, podría caber en GPUs de consumo como RTX 4090 (24 GB) si se usa 4 bits, pero no hay garantía.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). También se menciona compatibilidad con endpoints en la región US.
- Latencia y throughput: no se dispone de datos específicos. Al ser un modelo MoE, la inferencia puede ser más rápida que un modelo denso del mismo tamaño, pero depende del número de parámetros activos, que no se conoce.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Existen otras versiones de la serie Affine de unconst (como r3, r228, h35, h1) que comparten arquitectura y metodología, pero no se han publicado métricas comparativas. Tampoco se conocen modelos externos con características equivalentes en cuanto a tamaño y entrenamiento DPO. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede estar restringido, ya que no se indica la licencia del modelo. Se recomienda contactar al autor antes de utilizarlo en producción.
- Sesgos y alucinaciones: al ser un fine-tuning de un modelo base, puede heredar sesgos presentes en los datos de entrenamiento originales, y como todo LLM, existe riesgo de generar información falsa o inventada.
- Recursos computacionales elevados: con 35B parámetros, la inferencia requiere hardware de gama alta, lo que limita su despliegue en entornos con recursos limitados.
- Documentación incompleta: no se especifican la longitud de contexto, los idiomas soportados ni los tipos de cuantización, lo que dificulta la evaluación de su idoneidad para casos concretos.
- Dependencia del modelo base: el rendimiento final depende en gran medida de la calidad del modelo base `marsplan0624/affine-5gedzafcvg-queen`, que no está documentado públicamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r334-online-dpo-merged
- Otras versiones de la serie Affine:
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r3-merged
  - https://huggingface.co/unconst/Affine-5czsc2fc98-r228-merged
  - https://huggingface.co/unconst/Affine-5czsc2fc98-h35-merged
  - https://huggingface.co/unconst/Affine-5czsc2fc98-h1-merged
- Despliegue en FriendliAI: https://friendli.ai/models/unconst/Affine-5czsc2fc98-h35-merged
