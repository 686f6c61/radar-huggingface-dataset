# thibaud-perrin/niverel-5b-v3-hnet-semantic-jepa-seed1337

## Resumen

Niverel-5b-v3-hnet-semantic-jepa-seed1337 es un modelo de lenguaje experimental desarrollado por thibaud-perrin, publicado en Hugging Face bajo una licencia no especificada. El nombre "5B" hace referencia al volumen del corpus de entrenamiento (5 mil millones de bytes), no al número de parámetros, que se sitúa en torno a 134 millones. El modelo combina una arquitectura basada en Mamba (modelos de espacio de estado) con una red H-Net semántica y un enfoque de aprendizaje JEPA (Joint Embedding Predictive Architecture), procesando directamente a nivel de byte. Es una release de investigación que forma parte de la serie Niverel, orientada a explorar arquitecturas alternativas al transformer para modelado de lenguaje eficiente.

La relevancia de este modelo radica en su enfoque híbrido: utiliza Mamba para capturar dependencias de largo alcance con coste lineal, H-Net para estructurar representaciones semánticas y JEPA para aprendizaje autosupervisado por predicción. Aunque no se han publicado benchmarks estándar, el autor proporciona métricas de bits por byte (BPB) en validación y test, indicando un rendimiento de compresión razonable. El modelo está diseñado para ejecutarse en GPU NVIDIA con soporte CUDA 12.8, y se distribuye con wheels específicas para A100 y H100.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (estado) + H-Net semántica + JEPA, procesamiento a nivel de byte |
| Parametros totales | 134.567.587 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (librería niverel, probablemente safetensors o formato propio) |

## Arquitectura y entrenamiento

El modelo combina tres componentes principales: una arquitectura Mamba (modelo de espacio de estado) que procesa secuencias de bytes con complejidad lineal, una red H-Net semántica que organiza las representaciones internas, y un módulo JEPA que aprende mediante predicción de representaciones en un espacio latente. Esta combinación busca superar las limitaciones de los transformers en cuanto a coste computacional y manejo de secuencias largas, operando directamente sobre bytes en lugar de tokens.

El entrenamiento se realizó sobre el dataset `thibaud-perrin/niverel-5b-research-svg-v5`, compuesto por 5 mil millones de bytes de datos SVG (gráficos vectoriales escalables). El presupuesto del run se fijó en 1.0 del presupuesto total de 5B, y se aplicó una política de frontera `strict_reset`. No se menciona el uso de técnicas de alineación como RLHF o DPO. El checkpoint está vinculado a una revisión de entrenamiento específica, y se proporciona el SHA-256 del checkpoint para verificación de integridad.

## Capacidades

- Generación de texto a nivel de byte: al procesar bytes directamente, puede manejar cualquier codificación sin necesidad de tokenización previa.
- Modelado de lenguaje autorregresivo: basado en la arquitectura Mamba, capaz de generar secuencias condicionadas.
- Representaciones semánticas mediante H-Net y JEPA: potencial para tareas de comprensión y razonamiento, aunque no se documentan capacidades específicas.
- Soporte para datos SVG: el entrenamiento se realizó sobre datos SVG, lo que podría permitir generación o análisis de gráficos vectoriales.
- No se documentan capacidades de tool calling, agentes, visión o audio.
- No se especifican capacidades multilingües.

## Casos de uso

No se han documentado casos de uso concretos para este modelo experimental. Dado su carácter de investigación y su entrenamiento específico sobre SVG, los posibles ámbitos de aplicación (aún no validados) incluyen:

- Investigación en arquitecturas de estado y procesamiento a nivel de byte: permite estudiar el comportamiento de Mamba combinado con H-Net y JEPA en tareas de modelado de lenguaje.
- Generación de gráficos vectoriales: al entrenarse sobre SVG, podría explorarse su uso para sintetizar o completar código SVG.
- Compresión de datos: las métricas BPB sugieren potencial en tareas de compresión sin pérdida.
- Análisis de secuencias largas: la arquitectura Mamba ofrece ventajas para contextos extensos, aunque no se ha probado.
- Prototipado de sistemas de generación de código: su procesamiento a nivel de byte podría adaptarse a lenguajes de programación, aunque requiere evaluación.
- Evaluación comparativa de modelos híbridos: sirve como referencia para comparar con transformers y otros modelos de espacio de estado.

Estos usos son hipotéticos y requieren validación empírica; no hay documentación oficial que los respalde.

## Benchmarks y rendimiento

El autor proporciona métricas de bits por byte (BPB) en validación y test, que miden la capacidad de compresión del modelo. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| BPB validación | 1,130263042981664 |
| BPB test | 1,1151335296944265 |

Estos valores indican un rendimiento de compresión moderado, pero no son comparables directamente con otros modelos sin contexto adicional.

## Requisitos de hardware

- GPU NVIDIA con soporte CUDA 12.8 y arquitectura sm_80 (A100) o sm_90 (H100), según las wheels proporcionadas.
- Se recomienda una runtime de Python 3.12 y PyTorch 2.11 con CUDA 12.8.
- El tamaño del repositorio es de 2,1 GB, lo que sugiere que los pesos podrían caber en GPUs con 8-16 GB de VRAM, pero no se especifica el consumo exacto.
- Para inferencia, se puede usar el entorno de Colab A100, como indica la model card.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; la librería niverel es propia y requiere instalación de wheels locales.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. No hay datos públicos sobre otros modelos que combinen Mamba, H-Net y JEPA a nivel de byte. Modelos como Mamba-2 o RWKV podrían ser comparables en arquitectura, pero no se han evaluado en las mismas condiciones.

## Limitaciones y advertencias

- Modelo experimental: no ha sido sometido a evaluaciones exhaustivas de seguridad, sesgos o robustez.
- Licencia "other": no se especifican términos de uso, lo que puede limitar su aplicación comercial.
- Entrenamiento específico en SVG: su rendimiento en otros dominios es desconocido.
- Sin documentación de capacidades: no se garantiza generación de texto coherente ni razonamiento fiable.
- Dependencia de herramientas propias: requiere la librería niverel y wheels CUDA específicas, lo que dificulta su integración en entornos estándar.
- Riesgo de alucinación y errores: al ser un modelo pequeño y no alineado, es probable que genere contenido incorrecto o incoherente.
- No se han realizado pruebas de contexto largo ni de multilingüismo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/thibaud-perrin/niverel-5b-v3-hnet-semantic-jepa-seed1337)
- [Dataset de entrenamiento](https://huggingface.co/datasets/thibaud-perrin/niverel-5b-research-svg-v5)
- No se han encontrado papers, blogs o repositorios adicionales.
