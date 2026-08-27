# TFMC/EXP

## Resumen

El modelo TFMC/EXP es un modelo de lenguaje publicado en Hugging Face por el usuario TFMC, con un tamaño de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones). El repositorio ocupa 146,9 GB e incluye pesos en formato safetensors y GGUF, según las etiquetas del modelo. Sin embargo, la ficha pública es extremadamente escasa: no se especifica la arquitectura, la licencia, los idiomas soportados ni el pipeline de uso. La fecha de creación (agosto de 2026) y la ausencia de documentación sugieren que se trata de un lanzamiento preliminar o experimental.

La relevancia actual del modelo es limitada debido a la falta de información técnica verificable. No se han publicado detalles sobre el entrenamiento, los datos utilizados ni las capacidades específicas. Aunque el nombre "EXP" podría indicar una versión experimental, no hay evidencia pública que permita evaluar su rendimiento o idoneidad para tareas concretas. Los resultados de búsqueda web no aportan datos sobre el modelo, sino que hacen referencia a un proyecto de bobina magnética (TFMC) sin relación con la inteligencia artificial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona GGUF en las etiquetas, pero sin detalle de variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF (según etiquetas) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo (si es transformer denso, MoE, SSM u otro). Tampoco se conocen los datos de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. La ausencia de una ficha técnica o de un paper asociado impide cualquier análisis sobre innovaciones arquitectónicas o metodológicas. El único dato objetivo es el número de parámetros, que lo sitúa en la gama de modelos de ~27 B, similar a otros modelos abiertos de tamaño medio, pero sin confirmación de su diseño interno.

## Capacidades

No se dispone de información verificable sobre las capacidades del modelo. Las etiquetas indican "conversational", lo que sugiere un uso orientado a diálogo, pero no hay ejemplos, demos ni documentación que respalden funciones específicas como generación de código, razonamiento matemático, tool calling o soporte multilingüe. No se puede afirmar ninguna capacidad concreta sin datos fiables.

## Casos de uso

No se pueden proponer casos de uso concretos y realistas debido a la falta de información sobre el modelo. Cualquier sugerencia sería especulativa y podría inducir a error a los desarrolladores. Se recomienda esperar a que el autor publique una ficha técnica completa o resultados de evaluación antes de considerar su adopción en proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado sus métricas con modelos similares.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Como referencia orientativa, un modelo de ~27 B de parámetros en precisión FP16 requiere aproximadamente 55 GB de VRAM solo para los pesos, lo que excede la capacidad de GPUs de consumo como la RTX 4090 (24 GB). Con cuantización a 8 bits se necesitarían unos 28 GB, y a 4 bits unos 14 GB, lo que podría caber en GPUs profesionales como la A100 (80 GB) o en configuraciones de múltiples GPUs. Sin embargo, estos cálculos son genéricos y no tienen en cuenta la arquitectura real del modelo, el tamaño del contexto ni la implementación de inferencia. No se conocen opciones de despliegue específicas (vLLM, llama.cpp, etc.) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El nombre "TFMC/EXP" no permite identificar una familia de modelos clara. Existe un repositorio relacionado "TFMC/Qwen3.8-27B-QAT-GGUF-EXP3" que sugiere una posible base Qwen, pero no hay confirmación oficial. Sin datos de arquitectura, rendimiento o licencia, cualquier comparación con alternativas como Llama 3.1 27B, Qwen 2.5 27B o Mistral 24B sería especulativa.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen la arquitectura, el entrenamiento ni las capacidades.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido, lo que impide su adopción en entornos empresariales.
- Riesgo de alucinación y sesgos desconocidos: sin evaluación publicada, no se puede valorar la fiabilidad del modelo.
- Posible estado experimental: el nombre "EXP" y la falta de actualizaciones sustanciales sugieren que podría ser un lanzamiento preliminar.
- No se recomienda su uso en producción sin una validación exhaustiva por parte del equipo que lo despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TFMC/EXP
- Repositorio relacionado (sin confirmación de vínculo): https://huggingface.co/TFMC/Qwen3.8-27B-QAT-GGUF-EXP3

No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
