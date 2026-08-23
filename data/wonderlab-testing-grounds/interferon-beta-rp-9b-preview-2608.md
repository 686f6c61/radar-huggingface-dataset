# Wonderlab-Testing-Grounds/Interferon-beta-RP-9B-Preview-2608

## Resumen

Interferon-beta-RP-9B-Preview-2608 es un fine-tune experimental del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Wonderlab-Testing-Grounds (cuenta asociada al proyecto Indexnusrefather). Se presenta como una versión de prueba temprana de lo que será el futuro Nyx-RP-9B-Instruct-2608-v2, un modelo orientado a roleplay (RP) y escritura creativa, con especial énfasis en contenido conversacional y escenas narrativas. El autor indica que esta beta utiliza un rango de adaptación (rank) de 160 y que el dataset empleado es más grande que el de la versión anterior (Nyx v1), aunque advierte que puede ser inestable.

El modelo se publica con licencia Apache 2.0, pesa aproximadamente 9,2 mil millones de parámetros y está disponible en formato safetensors y GGUF. Aunque el autor lo etiqueta como "Potentially unstable" y "experimental", su interés radica en explorar alternativas de entrenamiento para fine-tunes de roleplay sobre la arquitectura Qwen 3.5, una de las más recientes de la familia Qwen. Actualmente no cuenta con descargas ni valoraciones en HuggingFace, y la información técnica disponible es escasa, limitándose a la model card y a las etiquetas del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen/Qwen3.5-9B, detalles internos no disponibles) |
| Parámetros totales | 9.197.093.888 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (se menciona en el repositorio, sin listado específico) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-9B, un transformer de la serie Qwen 3.5, pero no se han publicado detalles específicos sobre la arquitectura interna (número de capas, atención, etc.) en la información disponible. El autor declara que es un fine-tune del modelo base, realizado con un dataset más amplio que el usado en Nyx v1, y que el enfoque de entrenamiento difiere del anterior porque el método aplicado en Nyx v1 "rompía" esta versión. No se mencionan técnicas como RLHF, DPO ni otras metodologías de alineación específicas. El autor indica que el rank de adaptación es 160 (probablemente en el contexto de LoRA o adaptadores de bajo rango), aunque no se detalla si el fine-tune es completo o parcial.

## Capacidades

- Generación de texto conversacional y narrativa creativa, con énfasis en roleplay (RP) y roleplay erótico (ERP).
- Escritura de historias y diálogos con un alto grado de creatividad, según las etiquetas del autor ("Creative writing", "Very high rank").
- Soporte de conversaciones multi-turno, aunque no se especifica la longitud máxima de contexto soportada.
- Capacidad multilingüe limitada: la model card indica solo inglés como idioma soportado.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-step.
- No se han documentado capacidades de visión, audio o modo de pensamiento.

## Casos de uso

- Roleplay en línea (foros, chats, juegos de rol): el modelo está diseñado para mantener personajes y narrativas coherentes en conversaciones de múltiples turnos, ideal para plataformas como Character.AI o juegos de rol por texto.
- Escritura creativa asistida: puede generar borradores de historias, diálogos y descripciones de escenas, útil para escritores que buscan inspiración o para generar contenido narrativo en proyectos de ficción.
- Simulación de personajes en videojuegos: puede servir como motor de diálogo para NPCs en juegos independientes o prototipos de narrativa interactiva.
- Creación de contenido para comunidades de roleplay: usuarios que gestionan foros o servidores de rol pueden usarlo para generar respuestas rápidas o rellenar escenas secundarias.
- Pruebas de fine-tunes en entornos experimentales: como es una versión beta, sirve para evaluar la calidad de fine-tunes sobre Qwen3.5-9B en tareas de RP antes de lanzar una versión estable.
- Desarrollo de chatbots personalizados con estilo de escritura específico: por su entrenamiento en RP, puede adaptarse a estilos narrativos concretos con una buena base de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda esperar a la versión estable (Nyx-RP-9B-Instruct-2608-v2) para obtener métricas confiables.

## Requisitos de hardware

- VRAM estimada: con 9,2 B de parámetros, en fp16 se necesitan aproximadamente 18 GB de VRAM. Con cuantizaciones GGUF de 4-5 bits, la VRAM se reduce a unos 6-8 GB, permitiendo ejecución en GPUs de consumo como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- GPU recomendadas: para máxima calidad, una RTX 4090 (24 GB) o A100 (40 GB) puede ejecutar la versión fp16 sin problemas. Para cuantización, cualquier GPU con 8-12 GB es suficiente.
- Compatibilidad con consumer GPU: sí, especialmente con GGUF. En cuantización Q5_K_M puede caber en 8 GB de VRAM.
- Opciones de despliegue: compatible con transformers (Python), llama.cpp y Ollama (para GGUF), y puede usarse con vLLM o TGI si se convierte al formato adecuado.
- Latencia y throughput: no disponibles; depende del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Interferon-beta-RP-9B-Preview-2608 | 9,2 B | No disp. | Apache-2.0 | HuggingFace |
| Indexnusrefather/Nyx-RP-9B-Instruct-2608-v1 | 9 B (aprox.) | No disp. | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B (base) | 9,2 B | No disp. | Apache-2.0 | HuggingFace |

No hay datos de rendimiento comparativo. Nyx-RP-9B-Instruct-2608-v1 es la versión anterior del mismo autor, y se espera que esta beta sea una evolución con un dataset más grande y un enfoque de entrenamiento distinto. No se dispone de información sobre otros modelos de la misma categoría (como Mistral-7B-RP o Llama-3-8B-RP) para comparar.

## Limitaciones y advertencias

- Modelo experimental y potencialmente inestable: el autor lo etiqueta como "Potentially unstable" y "experimental", por lo que no se recomienda para entornos de producción.
- Sesgos de contenido: al estar orientado a RP y ERP, puede generar contenido sexualmente explícito o inapropiado, con riesgo de sesgos de género o de estereotipos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar información o perder la coherencia en conversaciones largas, especialmente al ser una versión beta.
- Limitaciones de idioma: solo inglés, lo que limita su uso en otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo no está curado y puede incluir contenido no deseado; se recomienda revisar el dataset y el comportamiento antes de desplegarlo.
- No se han publicado pruebas de seguridad ni de alineación; no se garantiza un comportamiento seguro en todos los contextos.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Wonderlab-Testing-Grounds/Interferon-beta-RP-9B-Preview-2608
- Versión anterior (Nyx v1): https://huggingface.co/Indexnusrefather/Nyx-RP-9B-Instruct-2608-v1
- Repositorio de archivos GGUF (ejemplo de cuantización): https://huggingface.co/Indexnusrefather/Nyx-RP-9B-Instruct-2608-v1/blob/main/Nyx-RP-9B-Instruct-2608-v1.Q5_K_M.gguf (no corresponde directamente a esta versión, pero indica la disponibilidad de formatos GGUF en el proyecto).
- Página del autor (no oficial): no disponible.
