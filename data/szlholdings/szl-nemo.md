# SZLHOLDINGS/szl-nemo

## Resumen

El repositorio `SZLHOLDINGS/szl-nemo` no contiene un modelo de lenguaje de gran tamaño ni un modelo generativo, sino un **surrogate de conformidad** implementado con scikit-learn. Se trata de un pipeline `Pipeline(TfidfVectorizer → LogisticRegression)` entrenado para clasificar si una respuesta de texto cumple cinco reglas doctrinales (R1–R5) definidas por SZL Holdings. El autor aclara explícitamente que no es NVIDIA Nemotron, no es un fine-tune de Nemotron y no debe cargarse con `from_pretrained` como si fuera un LLM.

La relevancia de este artefacto radica en su propósito: servir como mecanismo de verificación determinista y auditable dentro de la infraestructura de gobernanza de IA de SZL Holdings. El repositorio contiene scripts (`forge.py`, `eval.py`), un recibo de entrenamiento (`TRAINING_RECEIPT.json`) y un manifiesto, pero **no incluye el fichero `model.joblib`** que contendría el modelo entrenado. Por tanto, a día de la consulta, no es posible cargar el modelo desde Hugging Face; solo se dispone de la definición del pipeline y de los resultados reportados en el recibo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: TfidfVectorizer + LogisticRegression |
| Parametros totales | no disponible (modelo no publicado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (vectorización TF-IDF sobre texto) |
| Tipos de cuantizacion | no aplica (modelo clásico, no neuronal) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (para los archivos de SZL en este repositorio) |
| Formato de pesos | joblib (no publicado actualmente; ausente del listado de archivos) |

## Arquitectura y entrenamiento

El pipeline está compuesto por un `TfidfVectorizer` que transforma el texto de entrada en una representación numérica de frecuencia de términos, seguido de una regresión logística que produce una clasificación binaria: conformidad o violación de las reglas doctrinales. No se trata de una arquitectura transformer, MoE ni SSM; es un modelo clásico de aprendizaje automático.

Según el `TRAINING_RECEIPT.json`, el entrenamiento se realizó el 2026-07-21 con scikit-learn 1.9.0, sobre un host Replit de 2 vCPU y semilla 20260721. El conjunto de datos contenía 5.620 filas etiquetadas por el verificador de reglas (2.638 conformes, 2.982 violaciones), divididas en 80/20 estratificado. La fidelidad frente al verificador de reglas es 1.0, y la precisión en paráfrasis no vistas es 0.8333 con una muestra de N=12. No se emplearon técnicas de RLHF ni DPO; el proceso es supervisado y determinista.

## Capacidades

- Clasificación binaria de respuestas de texto según cinco reglas doctrinales (R1–R5).
- Verificación determinista mediante la función `rule_check()` en `scripts/forge.py`, que actúa como referencia de verdad.
- No genera texto, no razona, no ejecuta código ni soporta tool calling.
- No es un modelo conversacional ni un asistente.
- No se han documentado capacidades multilingües específicas.
- No incluye modo de pensamiento, visión ni audio.

## Casos de uso

- Control de calidad de salidas de LLM: el pipeline puede clasificar si una respuesta generada por un modelo de lenguaje cumple las reglas doctrinales de SZL, permitiendo filtrar o marcar respuestas no conformes en un flujo de producción.
- Auditoría de conformidad en sistemas de gobernanza de IA: al ser determinista y auditable, sirve como registro de verificación para demostrar que una respuesta cumple ciertos criterios antes de su liberación.
- Evaluación de recetas de inferencia local: en el contexto de SZL, se usa para validar que las respuestas de un modelo (por ejemplo, Nemotron 3 Nano 4B) se ajustan a las doctrinas definidas, sin necesidad de reentrenar el modelo grande.
- Integración en pipelines de datos: puede incorporarse como paso de preprocesamiento o validación en flujos de ingestión de texto, clasificando automáticamente documentos o mensajes.
- Pruebas de regresión en desarrollo de software: permite verificar que cambios en prompts o en el sistema no alteran la conformidad doctrinal de las respuestas.
- Documentación de cumplimiento normativo: el recibo de entrenamiento y los scripts permiten trazar cómo se decidió la conformidad, útil para auditorías externas o internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de LLM (MMLU, HumanEval, GSM8K, etc.) porque este artefacto no es un modelo generativo. Los únicos datos de rendimiento disponibles provienen del recibo de entrenamiento:

| Metrica | Valor | Notas |
|---|---|---|
| Fidelidad frente a rule_checker | 1.0 | Sobre el conjunto de validación |
| Precisión en paráfrasis no vistas | 0.8333 | N=12, muestra pequeña |
| Tamaño del conjunto de entrenamiento | 5.620 filas | 2.638 conformes, 2.982 violaciones |

Estos valores no son comparables con benchmarks de LLM y deben interpretarse como una validación interna del clasificador de conformidad.

## Requisitos de hardware

- El modelo es un pipeline clásico de scikit-learn, por lo que se ejecuta en CPU sin necesidad de GPU.
- El entrenamiento se realizó en un host Replit de 2 vCPU, lo que indica requisitos mínimos.
- Para inferencia, basta con un entorno Python con scikit-learn y joblib instalados.
- No se requieren tarjetas gráficas específicas (A100, H100, RTX 4090, etc.).
- Despliegue típico: cargar el fichero `model.joblib` con `joblib.load()` y ejecutar `predict()` sobre nuevos textos. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI porque no es un modelo de red neuronal.

## Comparativa con modelos similares

No disponible. Este artefacto no es un LLM y no existen modelos comparables estándar en la misma categoría (un clasificador de conformidad doctrinal basado en TF-IDF y regresión logística). No se pueden comparar parámetros, contexto, rendimiento ni licencia con alternativas de modelos de lenguaje.

## Limitaciones y advertencias

- **No es un LLM**: no debe tratarse como Nemotron ni como un modelo generativo; cualquier intento de usarlo como chatbot fallará.
- **Pesos no publicados**: el fichero `model.joblib` no está presente en el repositorio; el recibo menciona un hash sha256, pero el blob no se ha subido. Hasta que se publique, no es posible cargar el modelo.
- **Muestra de validación pequeña**: la precisión en paráfrasis no vistas se calculó con solo 12 ejemplos, lo que limita la fiabilidad estadística de ese dato.
- **Sesgo potencial**: el modelo se entrenó con datos etiquetados por un verificador de reglas; si esas reglas o las etiquetas contienen sesgos, el modelo los heredará.
- **Licencia**: Apache-2.0 cubre los archivos de SZL en este repositorio, pero si se obtiene Nemotron por separado, se aplica la licencia de NVIDIA. No se republican pesos de NVIDIA aquí.
- **Sin capacidad de generación**: no puede producir texto, código ni respuestas; solo clasifica texto preexistente.
- **Contexto limitado**: al usar TF-IDF, no se modela el orden de las palabras ni relaciones semánticas profundas; puede fallar ante paráfrasis complejas o vocabulario no visto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-nemo
- Discusión sobre la clasificación como receta Ollama: https://huggingface.co/SZLHOLDINGS/szl-nemo/discussions/1
- Página del producto SZL-Nemo: https://a-11-oy.com/nemo
- Repositorio GitHub de SZL Holdings: https://github.com/szl-holdings
- Código fuente de la versión del modelo en GitHub: https://github.com/szl-holdings/a11oy/tree/main/model_release/szl-nemo
- Documentación para desarrolladores de SZL Holdings: https://holdings.a-11-oy.com/docs-site/developers/
