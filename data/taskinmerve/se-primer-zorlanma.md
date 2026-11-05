# taskinmerve/se-primer-zorlanma

## Resumen

SE Primer — zorlanma modeli v2.1.0 es un clasificador tabular binario desarrollado por la usuaria de HuggingFace `taskinmerve` como componente del proyecto educativo SE Primer, un juego de simulación de crisis para estudiantes de ingeniería de software. El modelo estima, al comienzo de cada decisión del juego, la probabilidad de que el jugador se "bloquee" en la siguiente decisión (es decir, que elija la opción arriesgada B o agote el tiempo). No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de `scikit-learn` con estandarización y regresión logística, exportado a ONNX (opset 17).

El modelo resuelve un problema de adaptación pedagógica: cuando la probabilidad estimada es mayor o igual a 0,5, se activa un "modo apoyo" que elimina la cuenta atrás y muestra una tarjeta de pista; por debajo de ese umbral se mantienen las reglas fijas de la versión anterior. La relevancia es limitada y acotada al contexto del juego: se trata de una demostración de extremo a extremo del flujo de trabajo (entrenamiento, exportación a ONNX, publicación y verificación de paridad), no de un modelo listo para producción con estudiantes reales.

El conjunto de datos es mayoritariamente sintético (1905 filas sintéticas frente a 60 reales, sobre 1965 decisiones y 655 sesiones), y el propio autor advierte que no hay evidencia de utilidad en jugadores reales: en las únicas filas reales de test (n=18) el AUC cae a 0,4625, prácticamente equivalente al azar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline `StandardScaler → LogisticRegression(class_weight="balanced")` de scikit-learn, exportado a ONNX (opset 17) |
| Parámetros totales | 9 coeficientes + 1 término independiente (regresión logística sobre 9 características) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, una fila por decisión) |
| Tipos de cuantizacion | no disponible (no procede para regresión logística ONNX) |
| Idiomas soportados | no disponible (las características son numéricas; los textos del juego están en turco) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`), con `config.json` que define el orden de las 9 características |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal clásico: estandarización de las 9 características de entrada seguida de una regresión logística con ponderación de clases balanceada y semilla 42. El modelo se entrenó con Python 3.11 y scikit-learn 1.9.1, y se exportó a ONNX con opset 17; la diferencia máxima de probabilidad entre la implementación de scikit-learn y la de ONNX es de 8,74e-08, muy por debajo de la tolerancia de 1e-4. El tensor de entrada `input` es float32 de forma `[n, 9]` y la salida `probabilities` es `[n, 2]`, donde la columna 1 corresponde a P(zorlandi), la probabilidad de bloqueo.

Las 9 características son: `karar_no` (orden de la decisión, 1-3), `konu_puani` (puntuación de habilidad en el tema, 0-100), `sure_baskisi` (si la cuenta atrás está activa, 0/1), `onceki_karar_suresi_sn` (tiempo empleado en la decisión anterior, en segundos), `onceki_gidip_gelme` (número de cambios A↔B en la decisión anterior), `onceki_riskli_sayisi` (número de opciones B o tiempos agotados en la sesión), `ipucu_sayisi` (pistas abiertas), `tutor_mesaj_sayisi` (preguntas al tutor) y `gecmis_riskli_oran` (proporción histórica de decisiones arriesgadas, 0-1). Los coeficientes estandarizados con mayor peso son `onceki_karar_suresi_sn` (+0,719) y `gecmis_riskli_oran` (+0,567); los de menor magnitud son `onceki_gidip_gelme` (-0,018) y `sure_baskisi` (-0,029).

Los datos provienen de `data/oturmas.csv` (sha256 `2d1547bf75e2a7d4…`) y la etiqueta `zorlandi` se genera automáticamente desde el propio juego, sin etiquetado manual; la tasa de positivos es 0,4743. La partición se hizo con `GroupShuffleSplit(test_size=0.3, groups=oturum_id)` y semilla 42, con umbrales de aceptación fijados antes del entrenamiento en `spec.md §8.4`.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de bloqueo a partir de 9 características numéricas por decisión.
- Inferencia por lotes mediante ONNX: acepta tensores `[n, 9]` y devuelve `[n, 2]`.
- Activación condicional de apoyo pedagógico según el umbral p ≥ 0,5 (modo apoyo) o p < 0,5 (reglas fijas de la v1).
- Integración con el motor del juego SE Primer mediante un contrato de características definido en `config.json → features`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- No tiene capacidades multilingües: las entradas son puramente numéricas.

## Casos de uso

- Adaptación de dificultad en tiempo real dentro del juego SE Primer: el motor consulta el modelo al inicio de cada decisión y, si p ≥ 0,5, desactiva la cuenta atrás y abre una tarjeta de pista; es adecuado porque la latencia de una regresión logística ONNX es mínima y no interrumpe el flujo de juego.
- Demostración docente del ciclo completo de MLOps: entrenamiento con scikit-learn, exportación a ONNX, publicación en HuggingFace y verificación de paridad numérica (diferencia máxima 8,74e-08); útil en asignaturas de ingeniería de software o aprendizaje automático.
- Validación de contratos de datos en pipelines educativos: el orden de las 9 características en `config.json` sirve como especificación ejecutable para probar integraciones entre el frontend del juego y el servicio de inferencia.
- Investigación sobre señales de bloqueo en entornos gamificados: los coeficientes estandarizados permiten analizar qué variables (tiempo de decisión previo, historial de riesgo) se asocian con el bloqueo, siempre con la cautela de que el 97 % de los datos es sintético.
- Prototipado de sistemas de tutoría adaptativa: el patrón de "predicción → modo apoyo → registro de la intervención" es reutilizable en otras aplicaciones educativas, aunque el modelo concreto no sea transferible fuera de los 3 escenarios de SE Primer.
- Pruebas de regresión en despliegues ONNX: el modelo y su tolerancia de paridad (1e-4) sirven como caso de prueba para validar versiones de runtime ONNX o cambios en el pipeline de preprocesado.

## Benchmarks y rendimiento

| Métrica (test) | Valor | Umbral de aceptación |
|---|---|---|
| ROC-AUC | 0,7269 | ≥ 0,7 |
| Recall (zorlanan, umbral 0,5) | 0,6043 | ≥ 0,6 |
| Accuracy (umbral 0,5) | 0,6684 | — |
| AUC de la base de reglas v1 (`1 − konu_puani/100`) | 0,4194 | el modelo debe superarlo (diferencia 0,3075) |
| Tamaño del conjunto de test | 591 decisiones | — |
| AUC solo con filas reales de test | 0,4625 (n=18) | — |
| Recall solo con filas reales de test | 0,5 (n=18) | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 50 MB; el modelo ONNX completo ocupa prácticamente nada y el repositorio declara 0,0 GB.
- GPU recomendadas: no requiere GPU; funciona en CPU con el runtime ONNX estándar.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso iGPU) y en cualquier CPU moderna.
- Opciones de despliegue: ONNX Runtime (Python, C++, JS), servicio HTTP propio, o integración directa en el backend del juego; no aplican vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo (regresión logística sobre 9 entradas) se espera un coste despreciable por inferencia, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (clasificadores tabulares específicos para predicción de bloqueo en juegos educativos). Como referencia cualitativa, la base de reglas de la v1 del propio proyecto obtiene un AUC de 0,4194 frente al 0,7269 del modelo en el conjunto de test mixto, pero esa comparación es interna al proyecto y no frente a alternativas externas.

## Limitaciones y advertencias

- Predominio de datos sintéticos: 1905 de las 1965 filas son sintéticas; el modelo aprende en gran medida los supuestos del generador (que una tendencia latente a la indecisión se refleja en el tiempo y en los cambios A↔B).
- Sin evidencia en jugadores reales: en las únicas 18 filas reales de test el AUC es 0,4625 y el recall 0,5, es decir, rendimiento equivalente al azar; el intervalo de confianza es amplio por el tamaño muestral.
- Muestra real pequeña y homogénea: procede de un grupo reducido de compañeros de la misma clase y no representa a la población general de estudiantes.
- Bucle de retroalimentación: cuando se activa el modo apoyo, el jugador ve la pista y baja su probabilidad de elegir B; las filas con `destek_modu = 1` deben evaluarse por separado en futuras versiones.
- Etiqueta ambigua: `zorlandi` no distingue entre bloqueo y exploración deliberada (curiosidad por el otro desenlace), según `spec.md §8.5`.
- Medición inconsistente de `onceki_gidip_gelme`: la escala difiere entre ratón y pantalla táctil.
- Uso prohibido por el autor: calificar, ordenar o eliminar estudiantes; aplicaciones fuera de los 3 escenarios de SE Primer; sistemas que tomen decisiones sobre personas (selección de personal, exámenes, disciplina); evaluación clínica o psicológica.
- Licencia MIT: permite uso comercial, pero el autor restringe explícitamente los contextos de uso en la model card; conviene respetar esas restricciones éticas aunque la licencia no las imponga legalmente.
- Antes de usar con una clase real se recomienda modo sombra (`RELEASE.md`) para recoger datos reales y reajustar el modelo solo con ellos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taskinmerve/se-primer-zorlanma
- Repositorio del proyecto SE Primer: https://github.com/mervetask990-art/yzm301-se-primer
