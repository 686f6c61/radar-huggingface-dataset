# Venkatesh2212/green-ai-carbon-audit

## Resumen

El repositorio `Venkatesh2212/green-ai-carbon-audit` no contiene un modelo de inteligencia artificial funcional, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning. Publicado el 28 de agosto de 2026 por el usuario Venkatesh2212, este artefacto documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento de un modelo no especificado, utilizando 6 GPUs NVIDIA A100 durante 116,1 horas de cómputo en la región europe-west4. La model card incluye el cálculo detallado de energía consumida (370,59 kWh) y emisiones (74,12 kg CO₂eq), siguiendo la metodología de CodeCarbon.

Este tipo de repositorio se enmarca en las iniciativas de Green AI, que buscan cuantificar y reducir la huella ambiental del entrenamiento de modelos. Su relevancia radica en servir como ejemplo de transparencia energética para la comunidad, aunque carece de cualquier componente de modelo o pipeline de inferencia. No se proporcionan detalles sobre la arquitectura, los parámetros o las capacidades del modelo subyacente, por lo que su utilidad práctica se limita a la auditoría de emisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |
| Hardware de entrenamiento | 6 × NVIDIA A100 |
| Tiempo de entrenamiento | 116,1 GPU-horas |
| Energia consumida | 370,59 kWh |
| Emisiones de CO2eq | 74,12 kg |
| Ubicacion del datacenter | europe-west4 |
| PUE del datacenter | 1,33 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo, ya que el repositorio no incluye pesos, configuraciones ni codigo de inferencia. La unica informacion disponible corresponde al proceso de entrenamiento: se trata de un fine-tuning realizado sobre un modelo base no identificado, empleando 6 GPUs NVIDIA A100 con un consumo estimado de 400 W por GPU. El tiempo total de computo fue de 116,1 GPU-horas, y el calculo de energia se realizo aplicando el PUE del datacenter (1,33). Las emisiones se estimaron usando un factor de 200 g CO₂eq/kWh, propio de la region europe-west4, resultando en 74,118 kg CO₂eq. No se menciona el uso de tecnicas como RLHF, DPO o cualquier innovacion arquitectonica.

## Capacidades

- No aplica: el repositorio no contiene un modelo de generacion de texto, razonamiento, codigo, vision ni ninguna otra capacidad de IA.
- Funciona como un registro de emisiones de carbono, no como un sistema ejecutable.
- No soporta tool calling, agentes, ni procesamiento multimodal.
- No hay evidencia de capacidades multilingues o de cualquier tipo de interaccion.

## Casos de uso

- Auditoria de emisiones en proyectos de IA: puede utilizarse como plantilla o referencia para documentar la huella de carbono de un fine-tuning, siguiendo el formato de CodeCarbon y los calculos mostrados.
- Educacion y divulgacion sobre Green AI: sirve como ejemplo didactico para estudiantes o equipos que necesiten comprender como se calculan las emisiones de entrenamiento.
- Comparacion de eficiencia energetica: investigadores pueden contrastar los datos de este repositorio (74,12 kg CO₂eq) con otros similares para evaluar el impacto de diferentes configuraciones de hardware.
- Integracion en informes de sostenibilidad: empresas que deban reportar el impacto ambiental de sus modelos pueden adaptar esta estructura para sus propias metricas.
- Validacion de metodologias de calculo: permite verificar la coherencia entre los valores declarados en YAML y los calculos manuales, como se muestra en la model card.
- Benchmarking de datacenters: los datos de PUE y ubicacion pueden compararse con otras regiones para decidir donde ejecutar entrenamientos mas ecologicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene evaluaciones de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) ni comparaciones de rendimiento con otras arquitecturas.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay un modelo desplegable.
- El entrenamiento descrito requirio 6 GPUs NVIDIA A100 (400 W cada una), lo que implica una infraestructura de datacenter o un cluster profesional.
- No se proporcionan estimaciones de VRAM, latencia o throughput.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no existe un artefacto de inferencia.

## Comparativa con modelos similares

La busqueda web revela otros repositorios con el mismo nombre `green-ai-carbon-audit`, creados por diferentes usuarios, que siguen la misma estructura de contabilidad de carbono. La comparativa se centra en los datos de emisiones declarados:

| Repositorio | GPUs | GPU-horas | Energia (kWh) | Emisiones (kg CO2eq) |
|---|---|---|---|---|
| Venkatesh2212/green-ai-carbon-audit | 6 × A100 | 116,1 | 370,59 | 74,12 |
| Bk-1928/green-ai-carbon-audit | 8 × H100 | 287,5 | 2318,4 | 463,68 |
| 24f1002802/green-ai-carbon-audit | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre el modelo base, la tarea o los resultados de calidad, por lo que la comparativa se limita a metricas de eficiencia energetica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo funcional; es solo un registro de emisiones. No puede utilizarse para inferencia, generacion o cualquier tarea de IA.
- No se especifica el modelo base sobre el que se realizo el fine-tuning, lo que impide evaluar su utilidad o reproducibilidad.
- La licencia no esta declarada, por lo que el uso comercial o la redistribucion del contenido podrian estar sujetos a restricciones desconocidas.
- Los calculos de carbono dependen de factores como el PUE y el factor de emision regional, que pueden variar; los valores presentados son estimaciones, no mediciones directas.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma, ya que no existe un modelo de lenguaje.
- Para produccion, este artefacto no ofrece ninguna capacidad util; su unico valor es documental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Venkatesh2212/green-ai-carbon-audit
- Repositorio similar de Bk-1928: https://huggingface.co/Bk-1928/green-ai-carbon-audit
- Repositorio similar de 24f1002802: https://huggingface.co/24f1002802/green-ai-carbon-audit/tree/main
- Articulo sobre Green AI (Liu et al. 2024): https://ejhusom.github.io/green-ai/
- Articulo sobre iniciativas de IA verde: https://www.sciencedirect.com/science/article/pii/S0959652624025393
- Demo de Carbon Accounting Audit (Gradio): https://sk8069-green-ai-carbon-audit.hf.space/
