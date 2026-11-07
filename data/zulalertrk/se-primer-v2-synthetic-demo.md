# zulalertrk/se-primer-v2-synthetic-demo

## Resumen

El modelo `zulalertrk/se-primer-v2-synthetic-demo` es un clasificador tabular de demostración publicado en Hugging Face bajo la librería scikit-learn, con exportación a ONNX. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un clasificador clásico (regresión logística ponderada, según la model card) entrenado sobre datos **sintéticos** para una tarea de tres entradas de comportamiento que deben predecir si la respuesta de un usuario será "corta" o "detallada". El autor lo etiqueta explícitamente como `0.1.0-demo` y advierte que no está validado con necesidades humanas reales ni es apto para publicación final.

La relevancia del artefacto es fundamentalmente metodológica y educativa: documenta un pipeline completo de selección de modelo con umbrales de aceptación predefinidos (balanced accuracy >= 0.70 y recall detallado >= 0.65), validación cruzada por sesiones, comparación entre modelos candidatos y exportación ONNX con verificación numérica (diferencia máxima 1.08e-07). La model card es inusualmente transparente sobre el fracaso del candidato real: con 49 etiquetas reales, el modelo obtuvo BA=0.50 y recall detallado=0.00, por lo que fue detenido antes de su exportación. El ONNX publicado corresponde únicamente al modelo sintético.

Por tanto, esta ficha describe un clasificador tabular de demostración, no un modelo generativo. No hay arquitectura transformer, ni parámetros en el sentido habitual, ni contexto de tokens, ni capacidades de generación de texto, código o visión. Cualquier uso en producción está expresamente desaconsejado por el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular clásico (regresión logística ponderada según la model card; empaquetado con scikit-learn y exportado a ONNX) |
| Parametros totales | no disponible (modelo lineal/tabular; no se publica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de tres características de comportamiento) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el artefacto se distribuye como modelo ONNX/sklearn) |
| Idiomas soportados | no disponible (la model card está en turco; el modelo no procesa texto libre) |
| Licencia | MIT |
| Formato de pesos | ONNX (exportado desde scikit-learn); el repositorio tiene 0.0 GB de tamaño |

## Arquitectura y entrenamiento

El modelo es un clasificador tabular clásico, no una red neuronal. Según la model card, se compararon dos candidatos mediante validación cruzada de 5 pliegues por sesión sobre datos externos de entrenamiento: una regresión logística ponderada (BA=0.470) y un árbol pequeño (BA=0.413). Se seleccionó la regresión logística, que en el conjunto de test fijo obtuvo una única medición de BA=0.25 y recall detallado=0.50, sin superar el umbral predefinido de 0.70/0.65. Ese candidato real **no** es el que se publica.

El artefacto publicado se entrenó sobre datos **sintéticos** generados por `scripts/generate_demo.py`. La evaluación reportada es un holdout del 25% por sesión con seed=42 (120 sesiones de entrenamiento y 40 de test), con balanced accuracy=0.926065 y recall detallado=0.904762. La exportación ONNX se verificó con una diferencia máxima de 1.08e-07 frente al modelo original. La model card subraya que el generador sintético construye la relación entre comportamiento y etiqueta, por lo que las métricas altas no indican generalización a personas reales. El contrato de características (orden, tipo, clases y hashes de datos/modelo) está definido en `config.json`, con `publishable=false`.

## Capacidades

- Clasificación tabular binaria de salida: elegir entre explicación "corta" o "detallada" a partir de tres entradas de comportamiento.
- Inferencia vía ONNX, con paridad numérica verificada frente al modelo scikit-learn original (diferencia máxima 1.08e-07).
- Validación de esquema JSON en tiempo de entrenamiento según el contrato de `config.json`.
- Umbral de probabilidad fijado en 0.5, sin garantía de calibración.
- Regla de respaldo basada en reglas disponible si el modelo no es fiable.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión ni audio.
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Docencia sobre pipelines de ML tabular: sirve para ilustrar el ciclo completo de definición de umbrales, validación cruzada por sesiones, comparación de candidatos y exportación ONNX con verificación numérica.
- Ejemplo de model card transparente: útil como plantilla para documentar fracasos de candidatos reales y distinguir artefactos sintéticos de modelos listos para producción.
- Pruebas de integración ONNX en CI: el artefacto permite validar cargadores ONNX y comprobaciones de paridad numérica sin depender de pesos grandes.
- Demostración de contratos de datos: el `config.json` con orden y tipo de características, clases y hashes sirve para enseñar validación de esquemas en pipelines.
- Prototipado de sistemas de decisión con umbral predefinido: útil para estudiar cómo se comporta un clasificador cuando no alcanza los criterios de aceptación y debe activarse una regla de respaldo.
- Reproducción de experimentos educativos: la separación entre datos sintéticos y reales, y el registro de métricas en `test-results/final-model-selection.json`, permiten reproducir el flujo de selección de modelo.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Balanced accuracy | 0.926065 | Holdout sintético 25% por sesión, seed=42 (120 train / 40 test) |
| Recall detallado | 0.904762 | Holdout sintético 25% por sesión, seed=42 |
| Diferencia máxima ONNX vs sklearn | 1.082318333e-07 | Verificación de exportación |
| Balanced accuracy (candidato real, CV 5 pliegues) | 0.470 (logística) / 0.413 (árbol) | Datos externos de entrenamiento |
| Balanced accuracy (candidato real, test fijo) | 0.25 | Test fijo, una sola medición |
| Recall detallado (candidato real, test fijo) | 0.50 | Test fijo, una sola medición |
| Balanced accuracy (modelo real con 49 etiquetas) | 0.50 | Holdout fijo por sesión |
| Recall detallado (modelo real con 49 etiquetas) | 0.00 | Holdout fijo por sesión |

Los umbrales de aceptación definidos en `spec.md` (BA >= 0.70 y recall >= 0.65) no se alcanzaron con datos reales. Las métricas altas corresponden exclusivamente al artefacto sintético y no representan rendimiento sobre usuarios reales.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; un modelo lineal tabular exportado a ONNX se ejecuta en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: sí, aunque innecesaria; puede ejecutarse en CPU integrada.
- Opciones de despliegue: ONNX Runtime, scikit-learn en Python, o cualquier runtime compatible con ONNX (por ejemplo, servicios de inferencia ligeros). No aplica vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (tres características de entrada y un clasificador lineal), la latencia esperada es de microsegundos a milisegundos en CPU, aunque no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| zulalertrk/se-primer-v2-synthetic-demo | Clasificador tabular sintético (sklearn/ONNX) | no disponible | no aplica | BA=0.926 en holdout sintético; BA=0.50 en datos reales | MIT | Hugging Face |
| kurtulus7182/SEPrimer | Clasificador tabular sintético (demo) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| Candidato real del mismo proyecto (logística ponderada) | Clasificador tabular | no disponible | no aplica | BA=0.25 / recall=0.50 en test fijo | no disponible | No publicado (detenido) |
| Candidato real del mismo proyecto (árbol pequeño) | Clasificador tabular | no disponible | no aplica | BA=0.413 en CV | no disponible | No publicado |

No se dispone de información sobre otros modelos comparables de la misma categoría y tarea en la búsqueda realizada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos; no validado con necesidades humanas reales.
- El propio autor declara que no es apto para publicación final (`publishable=false` en `config.json`).
- Sesgo de autoinforme en las entradas de comportamiento.
- Muestra pequeña: 120 sesiones de entrenamiento y 40 de test en el artefacto sintético; 49 etiquetas reales en el intento con datos reales.
- La separación por sesión no equivale a separación por persona: un mismo individuo puede aparecer en train y test.
- Efecto de repetición y de expectativa de la interfaz no controlados.
- Sin garantía de calibración de probabilidades; umbral fijo en 0.5.
- Riesgo de alucinación no aplica (no genera texto), pero sí riesgo de clasificación errónea con apariencia de validez.
- Uso expresamente desaconsejado para: decisiones clínicas o sanitarias, inferencia de personalidad, calificación de exámenes, selección o eliminación de estudiantes y procesamiento de datos sensibles.
- Licencia MIT permite uso comercial del artefacto, pero las advertencias del autor y la naturaleza sintética hacen inadecuado su uso en producción.
- No procesa texto libre ni admite instrucciones; cualquier expectativa de modelo conversacional es incorrecta.

## Enlaces

- Hugging Face: https://huggingface.co/zulalertrk/se-primer-v2-synthetic-demo
- Modelo relacionado (SEPrimer): https://huggingface.co/kurtulus7182/SEPrimer
- Repositorio de referencia citado en la model card: https://github.com/seyyah/huggingface-hello-web
- Informe de selección de modelo (referenciado en la model card): `test-results/final-model-selection.json` (no se proporciona URL pública)
- Especificación de umbrales (referenciada en la model card): `spec.md` (no se proporciona URL pública)
