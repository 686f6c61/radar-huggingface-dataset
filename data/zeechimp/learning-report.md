# zeechimp/learning-report

## Resumen

`zeechimp/learning-report` no es un modelo de lenguaje ni una red neuronal con pesos publicados: es un paquete de código en numpy, distribuido a través de HuggingFace con la etiqueta de librería `learning-report` y `pipeline_tag: other`. Lo firma el usuario zeechimp y su objetivo es aportar dos herramientas de evaluación: una lista de comprobación diagnóstica que genera un informe de calibración y generalización imposible de resumir en un único número de accuracy, y una calculadora de volumen de datos de entrenamiento que estima cuántos ejemplos hacen falta antes de lanzar un experimento.

El problema que aborda es metodológico. Un modelo puede declarar un 97 % de accuracy y ocultar cuatro fallos distintos: ausencia de evaluación con conjunto reservado, falta de particiones fuera de distribución (OOD), una temperatura que ha caído en el borde de la rejilla de búsqueda y una distribución de salida colapsada en una sola clase. La herramienta desglosa esas dimensiones en cuatro particiones (interpolación, near-OOD, far-OOD y structural-OOD), calcula confianza media y ECE en cada una, detecta temperaturas en el límite de la rejilla y avisa del colapso de clases mediante una canaria de uniformidad de salida.

Es relevante ahora porque el ecosistema open source está lleno de model cards con cifras aisladas y sin trazabilidad metodológica. Al ser código puro de numpy, sin pesos ni tokenizador, se ejecuta en CPU en menos de un minuto, lo que lo hace apto como paso de verificación reproducible en pipelines internos de evaluación. El repositorio tiene licencia Apache 2.0, documentación en inglés, cero descargas y un like en el momento de la consulta, y fue creado el 1 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: biblioteca de diagnóstico en numpy; no es una red neuronal publicada con pesos |
| Parametros totales | no aplicable al paquete; el MLP de demostración tiene 2.632 parametros (in_dim=40, hidden=32, out_dim=40) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplicable: no procesa lenguaje natural |
| Tipos de cuantizacion | no aplicable: no hay pesos que cuantizar |
| Idiomas soportados | inglés (documentación, API y mensajes del informe) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplicable: se distribuye como código Python (`learning_report.py`), sin pesos |
| Dependencias | numpy |
| Requisitos de ejecución | CPU; ejecución completa en menos de un minuto según la model card |
| Distribución | script Python; `pip install numpy` + `python learning_report.py` |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creación / actualización | 2026-10-01 / 2026-10-01 |

## Arquitectura y entrenamiento

El repositorio contiene dos utilidades independientes. La primera, la lista de comprobación diagnóstica, espera un modelo que exponga `.predict_proba` y construye un `LearningReport` con los siguientes campos: número de parámetros, ejemplos de entrenamiento, accuracy de entrenamiento, temperatura ajustada (con marca `[BOUNDARY]` si cae en el borde de la rejilla de búsqueda), uniformidad de salida (entropía normalizada del histograma de predicciones), probabilidad máxima media, veredicto (`[ok]`, `[?]`, `[??]`, `[???]` según el número de problemas) y la lista de incidencias en lenguaje natural. Las cuatro particiones que evalúa son interpolación (operandos dentro del rango de entrenamiento, misma operación), near-OOD (un eje extendido), far-OOD (todos los operandos fuera del rango) y structural-OOD (operandos dentro del rango, operación distinta). Esta última es, según el autor, la partición crítica y la que casi nunca se reporta, porque separa "aprendió la regla de la suma" de "aprendió la tabla entrada-salida".

La segunda utilidad es la calculadora de volumen de datos, con dos estimaciones. La fórmula es `N ≈ k · P / log2(C) · 1 / (1 - target_acc)`, con `k = 0,05` calibrado sobre la tarea de demostración; por ejemplo, para `n_params=2632`, `n_classes=40` y `target_acc=0.80` devuelve 124. La vía empírica entrena el modelo en una escalera de tamaños de conjunto de datos, ajusta una curva saturada a la accuracy resultante e invierte para recomendar un N. Se ofrecen dos familias de curva: exponencial, `acc(N) = acc_max · (1 - exp(-N / N_half))`, para saturación suave, y Hill, `acc(N) = acc_max · N^h / (N_half^h + N^h)`, para escaleras con forma de escalón. El exponente Hill `h` funciona como diagnóstico: `h > 1` indica transición cooperativa y, en ese caso, el ajuste exponencial sobreestima sistemáticamente el N necesario.

Como demostración, el paquete entrena un MLP de 2.632 parámetros sobre la tarea `a + b` con `a, b ∈ [0, 9]` y 60 ejemplos. La autocomprobación integrada pasa 21 de 21 verificaciones; entre las que el autor considera críticas están `threshold: ece fires when ece>0.20`, `threshold: underconf fires when conf<0.40 and acc>0.5`, `curve fit hill beats exp on step data` y `boundary: T=20 flagged`. La información proporcionada se corta al inicio del volcado del informe de diagnóstico (tras la línea `training examples`), por lo que no se dispone del resto de cifras del informe de demostración.

## Capacidades

- Generación de informes de diagnóstico de evaluación con cuatro particiones etiquetadas (interpolación, near-OOD, far-OOD, structural-OOD).
- Cálculo de ECE (Expected Calibration Error) y confianza media por partición, con `n` de cada una.
- Ajuste de temperatura con detección de valores en el borde de la rejilla de búsqueda (`[BOUNDARY]`).
- Canaria de uniformidad de salida: entropía normalizada del histograma de predicciones para detectar colapso a una única clase.
- Cálculo de probabilidad máxima media como comprobación complementaria de calibración.
- Veredicto agregado por recuento de incidencias y lista de problemas en inglés.
- Estimación del volumen de datos necesario mediante fórmula cerrada (`k = 0,05`).
- Estimación empírica del volumen mediante escalera de tamaños de dataset y ajuste de curva (exponencial o Hill).
- Diagnóstico del exponente Hill `h` para decidir qué familia de curva usar.
- Entrenador MLP mínimo en numpy y utilidades de generación de datos para tareas de suma y multiplicación (`make_add_data`, `make_add_model`, `sample_pairs`, `encode_pairs`, `labels_add`, `labels_mul`).
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- Auditoría interna de claims de accuracy: antes de publicar un resultado, se ejecuta `diagnose()` sobre el modelo y se adjunta el informe con las cuatro particiones, de modo que el número principal quede respaldado por ECE, uniformidad de salida y veredicto.
- Pre-registro del coste de datos: con `estimate_volume_formula()` se obtiene una primera estimación de ejemplos necesarios; si el número es inasumible, el experimento se descarta antes de gastar cómputo.
- Planificación de campañas de etiquetado: la escalera empírica (`estimate_volume_empirical`) permite fijar el presupuesto de anotación con dos familias de curva y elegir la que mejor describe el escalón observado.
- Detección de colapso de clases: la canaria de uniformidad de salida señala clasificadores que predicen siempre la misma clase pese a mostrar accuracy alta en entrenamiento; útil en clasificadores tabulares o de juguete antes de escalarlos.
- Diagnóstico de calibración en producción: si un modelo desplegado está sobreconfiado, el ajuste de temperatura y el ECE por partición cuantifican la corrección y detectan si la temperatura óptima toca el límite de la rejilla, señal de que el modelo está peor calibrado de lo que el ajuste puede expresar.
- Separación de memorización frente a generalización estructural: la partición structural-OOD, con operandos dentro del rango pero operación distinta, permite comprobar si un modelo pequeño ha aprendido una regla o una tabla entrada-salida; aplicable a pruebas de juguete y a validar hipótesis sobre arquitecturas antes de invertir en modelos mayores.
- Verificación continua en CI: la autocomprobación de 21 comprobaciones puede ejecutarse como test suite en un runner sin GPU, en menos de un minuto, para evitar regresiones en el propio código de evaluación.
- Docencia y formación en metodología de evaluación: el paquete entrena en segundos en CPU y sirve como laboratorio reproducible para practicar calibración, OOD y estimación de volumen de datos sin necesidad de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos o herramientas en la información disponible. El repositorio no contiene pesos ni tareas de referencia estándar (MMLU, HumanEval, GSM8K u otras); los únicos datos de rendimiento aportados son los de su propia demostración.

| Prueba | Resultado | Contexto |
|---|---|---|
| Autocomprobación integrada | 21/21 comprobaciones superadas | Paquete completo, según la model card |
| `threshold: ece fires when ece>0.20` | pasa | Umbral de ECE alto reportado |
| `threshold: underconf fires when conf<0.40 and acc>0.5` | pasa | Detección de sobrecorrección de temperatura |
| `curve fit hill beats exp on step data` | pasa | Selección de familia de curva según forma de los datos |
| `boundary: T=20 flagged` | pasa | Detección de temperatura en el borde de la rejilla |
| Tarea de demostración | MLP de 2.632 parámetros sobre `a + b`, `a, b ∈ [0, 9]`, 60 ejemplos | Sin cifras de accuracy finales en la información disponible |
| Estimación por fórmula | `n_params=2632`, `n_classes=40`, `target_acc=0.80` → 124 ejemplos | Ejemplo de la model card |

## Requisitos de hardware

- VRAM para inferencia: no aplicable. No hay pesos ni inferencia de red neuronal en el paquete; no requiere GPU.
- GPU recomendadas: ninguna. La ejecución documentada es en CPU.
- Compatibilidad con GPU de consumo: no aplicable, al no existir carga de inferencia.
- Memoria principal: no se especifica cifra; el modelo de demostración tiene 2.632 parámetros y el paquete depende únicamente de numpy, por lo que el consumo es mínimo.
- Opciones de despliegue: ejecución directa de `python learning_report.py` o importación como módulo Python (`from learning_report import ...`). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir.
- Latencia y throughput: la model card indica ejecución completa en menos de un minuto en CPU. No se aportan medidas de latencia por llamada ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de herramientas comparables (por ejemplo, suites de evaluación, librerías de calibración o marcos de estimación de volumen de datos), ni cifras de rendimiento de terceros que permitan una comparación rigurosa. Además, la naturaleza del artefacto (biblioteca de diagnóstico en numpy, sin pesos) hace que no sea directamente comparable con modelos de lenguaje u otros modelos publicados en HuggingFace. Cualquier tabla comparativa con LLM o con frameworks de evaluación exigiría datos que no se han facilitado y que no deben inferirse.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no tiene tokenizador, no soporta tool calling ni agentes, y no puede usarse como sustituto de un LLM en ninguna tarea de lenguaje.
- Umbrales calibrados sobre una única tarea de demostración: los valores `ece>0.20`, `conf<0.40`, `acc>0.5` y `T=20` proceden de la tarea `a + b` con 60 ejemplos; no hay evidencia en la información disponible de que se transfieran a otros dominios o a modelos de mayor tamaño.
- El factor `k = 0,05` de la fórmula de volumen está calibrado explícitamente sobre la tarea de demostración; usarlo en otro problema sin recalibrar puede producir estimaciones sesgadas.
- La familia de curva elegida condiciona la recomendación: si la escalera tiene forma de escalón y se ajusta una exponencial, el N recomendado queda sistemáticamente sobreestimado. El autor señala el exponente Hill como mitigación, pero depende de que se detecte la forma correcta.
- Documentación incompleta en la información disponible: el volcado de la model card se interrumpe en la sección de resultados del informe de diagnóstico, por lo que faltan las cifras finales de la demostración.
- Posible errata en el ejemplo de uso: el fragmento del ajuste Hill incluye `make_data=make_add_model and make_add_data`, una expresión que parece un error de edición y que podría fallar si se copia tal cual.
- Idioma: documentación y mensajes del informe únicamente en inglés; no hay traducciones ni soporte multilingüe.
- Validación externa escasa: 0 descargas y 1 like en el momento de la consulta, sin auditoría de terceros ni resultados replicados por otros usuarios.
- Estado del repositorio: creado y actualizado el mismo día (2026-10-01), sin historial de versiones ni releases documentadas en la información disponible.
- Licencia: Apache 2.0 permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia, y con concesión de patentes; no se detectan restricciones adicionales, pero tampoco se ofrece garantía alguna por parte del autor.
- Riesgo de mala interpretación: la herramienta está diseñada para modelos con salida probabilística y clasificación; aplicarla a modelos generativos exigiría una capa de adaptación no incluida en el paquete.
- Riesgo de alucinación y sesgos del propio modelo: no aplicable, al no existir modelo generativo. Los riesgos relevantes son metodológicos (falsos negativos si el modelo evaluado no expone `.predict_proba` correctamente, o falsos positivos si las particiones OOD se construyen mal).

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/zeechimp/learning-report
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
