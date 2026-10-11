# xensive/llama3.2-noinstructv1.6.6

## Resumen

xensive/llama3.2-noinstructv1.6.6 es un ajuste fino del modelo Llama 3.2 3B realizado por el usuario independiente xensive. Parte concretamente de la variante cuantizada a 4 bits publicada por Unsloth (unsloth/llama-3.2-3b-unsloth-bnb-4bit), lo que sitúa el modelo en la categoría de los 3 000 millones de parámetros con arquitectura transformer densa y una ventana de contexto heredada de 128 000 tokens. El autor lo distribuye en Hugging Face bajo licencia declarada apache-2.0 y entrenado con el dataset mlabonne/FineTome-100k mediante Unsloth y TRL sobre una GPU T4 de Google Colab.

El modelo se presenta como una variante "no instruct" que, según el propio changelog del autor, se aproxima en torno a un 80 % al comportamiento de un modelo instruct convencional, razona de forma deficiente y obtiene resultados flojos en matemáticas. No hay resultados de benchmarks publicados, no tiene descargas ni valoraciones en el momento de redactar esta ficha y la model card es mínima e informal, por lo que debe considerarse un experimento de ajuste fino más que un modelo listo para producción.

Su relevancia es fundamentalmente metodológica: documenta un flujo de trabajo reproducible de ajuste fino con QLoRA y Unsloth sobre hardware de gama de consumo, y sirve como artefacto de estudio para analizar el efecto del dataset FineTome-100k y la ausencia de alineación de seguridad en un modelo pequeño de la familia Llama 3.2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only heredado de Llama 3.2 3B (GQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 3 210 millones (modelo base Llama 3.2 3B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama 3.2 3B) |
| Tipos de cuantizacion | Base de entrenamiento en 4 bits con bitsandbytes; existen versiones GGUF del predecesor v1.6.5; transformadores y safetensors en el repo principal |
| Idiomas soportados | inglés (en) según la model card |
| Licencia | apache-2.0 declarada por el autor (ver limitaciones) |
| Formato de pesos | safetensors; repositorio de 0,1 GB (unos 115 MB), compatible con text-generation-inference |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer denso solo decodificador con 28 capas, dimensión oculta de 3 072, 24 cabezas de atención y 8 cabezas de clave-valor (Grouped Query Attention), vocabulario de 128 256 tokens y funciones de activación SwiGLU. Según la documentación de Meta, esta variante se entrenó con 9 billones de tokens y tiene un corte de conocimiento en diciembre de 2023. El ajuste fino no modifica la arquitectura: parte de la versión ya cuantizada a 4 bits de Unsloth y aplica entrenamiento supervisado con TRL SFTTrainer, en un formato típico de QLoRA sobre una única GPU T4 de Colab.

El único dataset declarado es mlabonne/FineTome-100k, una colección de aproximadamente 100 000 conversaciones en formato ShareGPT, con mezcla de datos sintéticos, generados y filtrados. La model card no especifica el número de tokens vistos, la configuración de LoRA (rango, alpha, dropout), la tasa de aprendizaje ni el número de épocas, y tampoco menciona fases de RLHF o DPO. El tamaño del repositorio, en torno a 115 MB, apunta a que se distribuyen adaptadores LoRA en lugar de pesos completos, aunque la model card no lo confirma explícitamente. No se documenta ninguna innovación técnica propia: se apoya íntegramente en el tooling de Unsloth y en las optimizaciones del modelo base.

## Capacidades

- Generación de texto en inglés y mantenimiento de conversaciones multi-turno, con un comportamiento conversacional que el autor sitúa en torno al 80 % de un modelo instruct estándar.
- Razonamiento básico limitado: el propio changelog indica que razona "de forma horrible" (sic) y que su desempeño matemático es flojo.
- Ausencia de rechazos: la model card afirma literalmente que el modelo "no rechaza nada todavía", lo que implica falta de alineación de seguridad.
- Soporte de plantillas de chat de Llama 3.2 vía tokenizador y formato de prompt, aunque el ajuste se hizo sobre un dataset sin sistema de instrucciones explícito.
- Capacidades multilingües restringidas al inglés; no se declara soporte de otros idiomas.
- No dispone de visión, audio ni modalidades adicionales: el modelo base Llama 3.2 3B es exclusivamente de texto.
- Tool calling y function calling: no verificado ni documentado en esta variante; el modelo base Llama 3.2 admite formatos de llamada a funciones, pero no hay evidencia de que el ajuste los preserve.
- Comportamiento agéntico y razonamiento multi-paso: no documentado y poco probable dado el tamaño y la calidad declarada.

## Casos de uso

- Reproducción de recetas de ajuste fino: sirve como caso de estudio completo de un pipeline QLoRA con Unsloth y TRL sobre una T4, útil para quienes quieren replicar el flujo con su propio dataset y comparar hiperparámetros.
- Investigación sobre alineación y seguridad: al ser un modelo sin rechazos declarados, resulta un artefacto útil para estudiar cómo se comporta un modelo base ajustado sobre datos instruct sin capa de alineación, y para construir comparativas frente a versiones alineadas.
- Prototipado local de asistentes conversacionales en inglés: cabe en GPU de gama de consumo y permite validar interfaces y flujos conversacionales sin coste de API, aceptando una calidad claramente inferior a la de un instruct equivalente.
- Ablaciones sobre datasets de instrucciones: permite medir el impacto de FineTome-100k sobre una base de 3B frente a otros datasets, aislando el efecto de los datos del efecto del modelo.
- Pruebas de latencia y despliegue: por su tamaño reducido es adecuado para medir throughput y consumo de VRAM en vLLM, TGI o llama.cpp antes de escalar a modelos mayores.
- Generación de borradores y texto libre en inglés: utilizable para producir texto exploratorio o creativo donde el criterio humano filtre después, dado que no aplica restricciones de contenido.
- Base para experimentos posteriores de RLHF o DPO: al partir de un checkpoint sin alineación, es un punto de arranque razonable para probar técnicas de preferencia sobre un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y la única valoración cualitativa es la del propio autor, que califica el razonamiento como deficiente y las matemáticas como flojas. La versión GGUF del predecesor v1.6.5 aparece en un índice de terceros con datos de contexto (8 192 tokens) que no coinciden con la ventana real del modelo base y que no deben tomarse como referencia.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: alrededor de 6,5 GB solo para pesos, más caché KV; en la práctica, entre 8 y 12 GB según longitud de contexto y tamaño de lote.
- VRAM estimada en 4 bits (NF4/bitsandbytes): aproximadamente 2 GB de pesos, con picos de 3 a 4 GB durante inferencia.
- VRAM estimada en GGUF Q4_K_M: unos 2 GB; en Q8, alrededor de 3,5 GB.
- GPU recomendadas: cualquier RTX 3060 de 12 GB, RTX 4060 de 8 GB, RTX 4090 o superiores funcionan con holgura; para despliegue en servidor, A100 o H100 están sobredimensionadas para este tamaño.
- Sí cabe en GPU de consumo: es uno de los pocos casos en los que un modelo de 3B se ejecuta íntegramente en GPUs de gama media y en equipos con 8 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta declarada), vLLM, llama.cpp u Ollama si se convierte a GGUF, y flujos de Unsloth para entrenamiento e inferencia rápida.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xensive/llama3.2-noinstructv1.6.6 | 3,21 mil millones (base) | 128 000 tokens (heredado) | inglés | apache-2.0 declarada | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128 000 tokens | multilingüe (8 idiomas oficiales) | Llama 3.2 Community License | Hugging Face, ampliamente desplegado |
| Qwen2.5-3B-Instruct | 3 090 millones | 32 768 tokens | más de 29 idiomas | Apache 2.0 | Hugging Face, ampliamente desplegado |
| google/gemma-2-2b-it | 2 610 millones | 8 192 tokens | multilingüe | Gemma Terms of Use | Hugging Face |

No hay datos de benchmarks de esta variante que permitan una comparación cuantitativa con esos modelos; la comparación anterior es únicamente de especificaciones, licencia y disponibilidad. Cabe señalar que la licencia apache-2.0 declarada por el autor entra en tensión con la licencia heredada del modelo base, que es la Llama 3.2 Community License.

## Limitaciones y advertencias

- Calidad declarada baja: el propio autor reconoce razonamiento deficiente, matemáticas flojas y una aproximación del 80 % a un instruct real; no debe usarse donde se exija fiabilidad.
- Ausencia total de alineación de seguridad: la model card afirma que el modelo no rechaza nada, lo que implica riesgo de generar contenido dañino, ilegal o sesgado sin filtro. Es una advertencia crítica para cualquier uso con usuarios finales.
- Inconsistencia de licencia: al ser un derivado de Llama 3.2, la licencia aplicable aguas arriba es la Llama 3.2 Community License, que impone condiciones de atribución ("Built with Llama") y restricciones de uso. Etiquetar el modelo como apache-2.0 no elimina esas obligaciones para uso comercial.
- Idiomas: únicamente inglés; no hay evidencia de capacidad en castellano ni en otros idiomas.
- Riesgo de alucinación elevado, especialmente en tareas de razonamiento y cálculo, sin benchmarks que permitan acotarlo.
- Sesgos heredados: el dataset FineTome-100k combina datos sintéticos y generados, por lo que arrastra los sesgos y las limitaciones de los modelos que lo produjeron, además de los del propio Llama 3.2.
- Corte de conocimiento en diciembre de 2023, heredado del modelo base.
- Validación comunitaria nula: cero descargas y cero valoraciones en el momento de redactar la ficha, sin issues ni evaluaciones independientes.
- Documentación insuficiente: la model card no detalla hiperparámetros de LoRA, número de épocas, composición exacta del dataset ni el procedimiento de fusión de pesos.
- Empaquetado ambiguo: el tamaño del repositorio sugiere adaptadores LoRA en lugar de pesos completos, lo que obligaría a cargar el modelo base cuantizado para poder ejecutarlo.
- Versionado inestable: existen múltiples iteraciones (v1.6.5, v1.6.5-gguf, v1.6.6) publicadas con pocas semanas de diferencia, sin changelog técnico detallado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xensive/llama3.2-noinstructv1.6.6
- Archivos del repositorio: https://huggingface.co/xensive/llama3.2-noinstructv1.6.6/tree/main
- Versión anterior v1.6.5: https://huggingface.co/xensive/llama3.2-noinstructv1.6.5
- Versión GGUF de v1.6.5: https://free2aitools.com/model/xensive/llama3.2-noinstructv1.6.5-gguf
- Modelo base cuantizado: https://huggingface.co/unsloth/llama-3.2-3b-unsloth-bnb-4bit
- Dataset de ajuste fino: https://huggingface.co/datasets/mlabonne/FineTome-100k
- Tarjetas y formatos de prompt de Llama 3.2 (Meta): https://dev.meta.ai/llama/docs/model-cards-and-prompt-formats/llama3_2
- Colección de modelos Llama (Meta): https://dev.meta.ai/llama/models/llama-3
