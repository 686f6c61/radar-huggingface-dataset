# ziyuan-li/bic-mac-tum-e612

## Resumen

BIC-MAC TUM E612 es un conjunto de 11 checkpoints publicados por el equipo TUM para su participación final en el reto BIC-MAC 2026. No es un modelo de lenguaje, sino un ensemble de modelos de imagen a imagen (pipeline `image-to-image`) especializados en corrección de atenuación para PET: predicen un mapa de atenuación CT (mu-map) a partir de PET sin corrección de atenuación (NAC-PET), un topograma de rayos X y resonancia magnética Dixon. El paquete se distribuye como pesos PyTorch con un manifiesto de integridad (`runtime-closure.json`) que registra tamanos y hashes SHA-256.

El modelo resuelve un problema clásico en imagen molecular: la corrección de atenuación en PET normalmente requiere una CT, lo que anade dosis de radiación y complejidad logística. Este ensemble propone generar esa CT sintética a partir de modalidades de menor dosis (topograma) y MRI, manteniendo la calidad del SUV en todo el cuerpo. Los resultados reportados en la model card sobre el conjunto de test oculto son un MAE de mu-map de 0,00591, un MAE de SUV de cuerpo completo de 0,0284 y un sesgo por órgano del 1,95 %.

La relevancia es acotada pero clara para el nicho de imagen médica: es un artefacto de competición reproducible, con verificación de pesos y código de inferencia publicado, que sirve como referencia técnica para pipelines de síntesis de CT y corrección de atenuación. El repositorio ocupa 1,6 GB y no incluye información sobre licencia ni idiomas, y el autor advierte explícitamente que no es un dispositivo médico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (ensemble de 11 checkpoints de imagen a imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (libreria `pytorch`), con manifiesto `runtime-closure.json` de tamanos y SHA-256 |
| Tamano del repositorio | 1,6 GB |
| Entrada | NAC-PET, topograma de rayos X y MRI Dixon |
| Salida | mapa de atenuación CT (mu-map) y CT sintética en NIfTI (`ct.nii.gz`) |
| Requisitos de ejecucion | Python 3.12, PyTorch 2.10.0, GPU NVIDIA |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna de los checkpoints en la información proporcionada. La model card describe únicamente el artefacto de entrega: 11 checkpoints correspondientes a los identificadores E06, E08, cinco modelos de fold E13, E13-full75, E24, E40 y E43. La nomenclatura sugiere un esquema de ensembling con variantes por fold y configuraciones de entrenamiento adicionales (E13-full75, E24, E40, E43), pero no se detalla la topología de red, el número de parámetros ni si se emplean arquitecturas tipo U-Net, transformers de imagen o modelos generativos.

Tampoco se especifican el volumen de datos de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino supervisado adicional. El pipeline declarado es `image-to-image` y la tarea es una regresión de imagen a imagen (predicción del mu-map) condicionada por tres modalidades de entrada. El repositorio incluye un script de verificación de pesos (`scripts/verify_weights.py`) que comprueba tamanos y hashes contra `runtime-closure.json`, lo que constituye la única garantía técnica documentada sobre la integridad del artefacto.

## Capacidades

- Predicción de mapa de atenuación CT (mu-map) a partir de NAC-PET, topograma de rayos X y MRI Dixon.
- Generación de CT sintética en formato NIfTI (`output/ct.nii.gz`) lista para pipelines de corrección de atenuación.
- Ensemble de 11 checkpoints con verificación de integridad mediante hashes SHA-256.
- Ejecución en GPU NVIDIA con PyTorch 2.10.0 y Python 3.12.
- Generación de informe de ejecución (`runtime-report.json`) para trazabilidad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, visión general, audio ni modo de pensamiento.

## Casos de uso

- Corrección de atenuación en PET sin CT: el ensemble genera el mu-map a partir de NAC-PET, topograma y MRI Dixon, lo que permite reconstruir SUV corregidos en estudios donde no se adquirió CT, reduciendo dosis al paciente.
- Investigación en imagen molecular: sirve como línea base reproducible para comparar métodos de síntesis de CT en PET/MRI, con métricas publicadas de MAE de mu-map y SUV.
- Reconstrucción de estudios retrospectivos: en cohortes con PET sin CT emparejada, el modelo puede generar CT sintética para habilitar análisis cuantitativos posteriores.
- Validación de pipelines de corrección de atenuación: el script de verificación de pesos y el informe de ejecución permiten auditar la reproducibilidad de resultados en entornos de investigación.
- Desarrollo de protocolos de baja dosis: al sustituir la CT por topograma y MRI, el modelo encaja en flujos clínicos de PET/MRI donde se busca minimizar la radiación adicional.
- Evaluación comparativa de modalidades de entrada: el ensemble con múltiples checkpoints permite estudiar la sensibilidad de la predicción del mu-map a distintas configuraciones de entrenamiento (folds y variantes E06 a E43).

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test oculto del reto BIC-MAC 2026:

| Metrica | Resultado |
|---|---:|
| CT mu-map MAE | 0,00591 |
| Whole-body SUV MAE | 0,0284 |
| Organ bias | 1,95 % |
| Brain outlier score | 0,0249 |
| Mean rank | 6,25 |

No se han publicado resultados comparativos frente a otros modelos en la información disponible.

## Requisitos de hardware

- GPU NVIDIA obligatoria según la model card; no se documenta soporte de CPU.
- VRAM estimada: no disponible. El repositorio pesa 1,6 GB, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible. La model card solo exige una GPU NVIDIA y el ejemplo de inferencia usa `--device cuda:0`.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de VRAM que permitan asegurar que quepa en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: inferencia directa con PyTorch mediante `python -m champion.predict`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Entorno: Python 3.12 y PyTorch 2.10.0.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de síntesis de CT para corrección de atenuación PET ni resultados frente a alternativas.

## Limitaciones y advertencias

- No es un dispositivo médico; la model card lo declara explícitamente y no debe usarse para diagnóstico o decisión clínica.
- Desarrollado específicamente para las entradas y la geometría del reto BIC-MAC; su uso fuera de ese dominio no está validado.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Idiomas no disponibles: el modelo no procesa texto, por lo que esta limitación no aplica, pero tampoco hay documentación multilingüe.
- No se publican detalles de arquitectura, datos de entrenamiento ni sesgos conocidos, lo que dificulta la auditoría técnica.
- Riesgo de alucinación no aplicable en el sentido de modelos de lenguaje, pero sí existe riesgo de predicciones de mu-map poco realistas fuera de la distribución de entrenamiento.
- Requiere GPU NVIDIA, Python 3.12 y PyTorch 2.10.0, lo que limita su despliegue en entornos con versiones anteriores.
- El rendimiento reportado corresponde a un test oculto de competición; no hay validación externa independiente publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ziyuan-li/bic-mac-tum-e612
- Repositorio de metodología e inferencia: https://github.com/ziyuan-li/bic-mac-2026-methodology
