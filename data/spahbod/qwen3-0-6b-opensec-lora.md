# spahbod/qwen3-0.6b-opensec-lora

## Resumen

`spahbod/qwen3-0.6b-opensec-lora` es un adaptador LoRA (PEFT) entrenado mediante Supervised Fine-Tuning sobre el modelo base `Qwen/Qwen3-0.6B`. Su propósito es el triaje de eventos de ciberseguridad: recibe la descripción textual de un incidente y genera una única etiqueta entre siete clases (`malicious`, `suspicious`, `benign`, `expected_admin`, `authorised_testing`, `misconfiguration`, `unknown`). Lo publica el usuario spahbod como proyecto educativo, con el código de entrenamiento, evaluación y ejecución en el repositorio `s25132/opensec-qwen-qlora`.

El adaptador se apoya en un transformer decoder-only de 0,6 mil millones de parámetros (arquitectura del Qwen3-0.6B, con contexto nativo de 32.768 tokens), al que se añaden pesos LoRA de bajo rango. El entrenamiento se realizó con `SFTTrainer` de TRL y PEFT 0.20.0 sobre el dataset `tegridydev/opensec-triage` (6.720 ejemplos de entrenamiento, 840 de validación y 840 de test), usando una única GPU de portátil con 4 GB de VRAM (NVIDIA GeForce RTX 3050 Laptop, CUDA 12.6).

Su relevancia es doble. Por un lado, demuestra que es viable afinar un modelo de menos de mil millones de parámetros para una tarea de clasificación de seguridad en hardware de consumo. Por otro, publica métricas desglosadas por clase que revelan un rendimiento muy desigual: accuracy global del 66,9%, con clases casi resueltas (`benign` al 97,5%, `unknown` al 91,7%) y una clase prácticamente fallida (`expected_admin` con un 2,5% de recall). Es, por tanto, un caso de estudio útil sobre los límites del fine-tuning con datasets pequeños y clases semánticamente solapadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-0.6B) con adaptador LoRA/PEFT |
| Parametros totales | 0,6 mil millones en el modelo base; tamano del adaptador no disponible (repositorio de 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados de Qwen3-0.6B (no declarada explicitamente en la ficha del adaptador) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizacion, pero la ficha no detalla formatos |
| Idiomas soportados | Ingles (idioma de los datos de entrenamiento); no se declaran otros idiomas |
| Licencia | No disponible; sujeta a las condiciones del modelo base y del dataset de entrenamiento |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |
| Libreria declarada | PEFT 0.20.0, compatible con Transformers, TRL y Accelerate |
| Pipeline | text-generation (uso real: clasificacion generativa de etiquetas) |
| Tamano del repositorio | 0,0 GB (solo contiene el adaptador, no los pesos completos) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only causal con contexto nativo de 32.768 tokens. No se modifica la arquitectura del modelo base: se inyectan matrices LoRA de bajo rango en las capas del transformer y se entrena únicamente ese subconjunto de parámetros, lo que reduce drásticamente el coste de memoria y el espacio en disco. La ficha no especifica el rango, el `alpha`, el `dropout` ni las capas objetivo del adaptador, por lo que esos hiperparámetros quedan como no disponibles.

El entrenamiento es Supervised Fine-Tuning puro con `SFTTrainer` de TRL y PEFT, en precisión mixta y sobre una NVIDIA GeForce RTX 3050 Laptop de 4 GB de VRAM con CUDA 12.6, Python 3.12 y PyTorch con soporte CUDA. El dataset `tegridydev/opensec-triage` contiene descripciones de eventos de seguridad etiquetadas en inglés, con 6.720 ejemplos de entrenamiento, 840 de validación y 840 de test, y siete clases objetivo. No se menciona RLHF, DPO ni ninguna fase de alineación posterior al SFT, ni tampoco innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento explícitos. La tarea se formula como generación de texto: el modelo emite la etiqueta como cadena, no como logits de un clasificador con cabeza dedicada.

## Capacidades

- Clasificación generativa de descripciones de incidentes de seguridad en siete categorías fijas: `malicious`, `suspicious`, `benign`, `expected_admin`, `authorised_testing`, `misconfiguration` y `unknown`.
- Generación de texto en inglés, heredada del modelo base Qwen3-0.6B.
- Rendimiento alto y consistente en cuatro de las siete clases: `benign` (recall 97,5%), `unknown` (91,7%), `authorised_testing` (86,7%) y `misconfiguration` (86,7%).
- Ejecución en hardware muy limitado: el adaptador se entrenó en 4 GB de VRAM y la inferencia cabe en GPU de consumo, CPU o incluso entornos embebidos.
- Formato de salida simple (una etiqueta textual), fácil de integrar en pipelines de enrutado y preclasificación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües: los datos de entrenamiento son exclusivamente en inglés.
- No hay capacidades de visión ni de audio.
- No se documenta un modo de razonamiento (thinking mode) específico, aunque el modelo base Qwen3 lo incorpora; el adaptador está entrenado para responder directamente con la etiqueta.

## Casos de uso

- Triage automatizado de alertas SIEM: el modelo recibe la descripción de una alerta y devuelve una etiqueta previa que enruta el incidente al flujo adecuado (malicioso, sospechoso, benigno, prueba autorizada), reduciendo el trabajo manual de primera línea en un SOC.
- Preclasificación en colas de tickets de seguridad: integrado como primer filtro, asigna una categoría a cada ticket entrante antes de la revisión humana, de modo que los analistas priorizan lo que realmente requiere atención.
- Filtrado de falsos positivos: gracias al 97,5% de recall en `benign`, es útil para descartar automáticamente eventos rutinarios y liberar capacidad analítica, siempre con verificación posterior.
- Etiquetado asistido para construir datasets: el adaptador puede usarse como etiquetador débil sobre grandes volúmenes de descripciones de eventos, generando una primera anotación que después se revisa y corrige manualmente.
- Docencia y experimentación con LoRA, PEFT y SFT: sirve como ejemplo reproducible de fine-tuning de un modelo sub-1B en hardware de consumo, con un dataset público y métricas por clase.
- Investigación comparativa entre clasificadores generativos y clásicos: permite medir si un modelo generativo pequeño supera o no a un clasificador tradicional (regresión logística, SVM sobre TF-IDF, etc.) en la misma tarea de triaje.
- Prototipado en entornos con recursos restringidos: al requerir muy poca VRAM, se puede desplegar en portátiles, edge devices o contenedores pequeños para validar un flujo de triaje antes de invertir en modelos mayores.
- Auditoría y monitorización de logs: clasificación preliminar de entradas de registro o descripciones operativas para detectar patrones anómalos, con revisión humana obligatoria dado el carácter educativo del modelo.

## Benchmarks y rendimiento

Evaluación sobre los 840 ejemplos del conjunto de test de `tegridydev/opensec-triage`.

| Metrica | Resultado |
|---|---|
| Accuracy global | 66,9% |
| Predicciones correctas | 562 / 840 |

| Clase | Correctas | Total | Recall |
|---|---:|---:|---:|
| `malicious` | 79 | 120 | 65,8% |
| `suspicious` | 45 | 120 | 37,5% |
| `benign` | 117 | 120 | 97,5% |
| `expected_admin` | 3 | 120 | 2,5% |
| `authorised_testing` | 104 | 120 | 86,7% |
| `misconfiguration` | 104 | 120 | 86,7% |
| `unknown` | 110 | 120 | 91,7% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La propia ficha señala que la clase `expected_admin` se confunde sistemáticamente con `benign` y `authorised_testing`, lo que explica el bajo recall de esa categoría y lastra la accuracy global.

## Requisitos de hardware

- VRAM para inferencia del modelo base: aproximadamente 1,2 GB en FP16 y en torno a 0,4 GB en cuantización de 4 bits (estimación a partir de los 0,6 mil millones de parámetros); el adaptador añade un consumo adicional muy reducido.
- Entrenamiento validado en una NVIDIA GeForce RTX 3050 Laptop con 4 GB de VRAM, CUDA 12.6, Python 3.12, PyTorch, PEFT 0.20.0, TRL y Accelerate.
- Cabe en cualquier GPU de consumo (RTX 3050, 3060, 4060, 4090), en GPUs integradas con memoria compartida y en ejecución sobre CPU.
- GPUs de数据中心 como A100 o H100 no son necesarias; solo tendrían sentido para servir muchas réplicas concurrentes o para reentrenar con lotes mayores.
- Opciones de despliegue: `transformers` + `peft` (procedimiento documentado por el autor), vLLM y TGI (si admiten adaptadores LoRA sobre el modelo base), Ollama y llama.cpp (fusionando el adaptador con los pesos base y convirtiendo a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en opensec-triage | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spahbod/qwen3-0.6b-opensec-lora | 0,6B + adaptador LoRA | 32.768 tokens (heredado) | Accuracy 66,9% en 840 ejemplos de test | No disponible | HuggingFace, 0 descargas y 0 likes |
| Qwen/Qwen3-0.6B (base) | 0,6B | 32.768 tokens | No evaluado en la ficha del adaptador | No disponible en la informacion proporcionada | HuggingFace |
| Clasificadores clasicos de triaje (TF-IDF + SVM/regresion logistica) | No aplica | No aplica | No disponible | No disponible | Implementacion propia |

No se dispone de datos de benchmarks de otras alternativas sobre el mismo conjunto de test, por lo que no es posible establecer una comparación cuantitativa rigurosa con modelos de la misma categoría.

## Limitaciones y advertencias

- Proyecto educativo declarado explícitamente por el autor; no está pensado para uso en producción sin validación adicional.
- Recall del 2,5% en la clase `expected_admin`: el modelo confunde sistemáticamente esta categoría con `benign` y `authorised_testing`, lo que puede provocar que actividad administrativa legítima se etiquete mal o, en sentido contrario, que eventos anómalos pasen desapercibidos.
- Recall del 37,5% en `suspicious`: una parte mayoritaria de los eventos sospechosos no se detecta con esta etiqueta.
- Riesgo de alucinación y de etiquetas mal formateadas: al ser un modelo generativo, puede devolver texto que no corresponda exactamente a ninguna de las siete clases.
- Los resultados pueden no transferirse a datos reales de producción, ya que proceden de un único dataset sintético o curado en inglés.
- Idiomas: el entrenamiento es exclusivamente en inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será peor.
- Licencia no disponible: el adaptador queda sujeto a las condiciones del modelo base (`Qwen/Qwen3-0.6B`) y del dataset (`tegridydev/opensec-triage`). Antes de cualquier uso comercial hay que verificar ambas licencias por separado.
- El modelo no debe tomar decisiones de seguridad de forma autónoma; toda predicción debe ser verificada por una persona.
- Contexto: aunque el modelo base soporta 32.768 tokens, la ficha no confirma que el adaptador haya sido entrenado con secuencias largas, por lo que el rendimiento con entradas extensas no está garantizado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validación por parte de terceros.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/spahbod/qwen3-0.6b-opensec-lora
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset de entrenamiento OpenSec Triage: https://huggingface.co/datasets/tegridydev/opensec-triage
- Repositorio con el codigo de entrenamiento, evaluacion y ejecucion: https://github.com/s25132/opensec-qwen-qlora
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos corresponden a paginas generales de YouTube y no guardan relacion con el adaptador).
