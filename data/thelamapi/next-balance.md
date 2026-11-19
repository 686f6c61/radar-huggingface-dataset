# thelamapi/Next-Balance

## Resumen

Next Balance es un artefacto de simulación publicado en Hugging Face por el usuario thelamapi bajo licencia Apache 2.0. No es un modelo de lenguaje ni una red neuronal entrenada con descenso de gradiente: es un paquete de control que compara dos estrategias (un PID fijo y un controlador adaptativo basado en mínimos cuadrados recursivos) para mantener una plataforma de elevación simulada a 0,5 m de altura mientras su carga y su fricción cambian en el tiempo. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que contiene únicamente scripts, datos de simulación y material de presentación, sin pesos de modelo en el sentido habitual.

El problema que aborda es el control robusto de un sistema de un grado de libertad con perturbaciones paramétricas: un cambio de carga alrededor de t≈4 s y un aumento de fricción alrededor de t≈7 s. La propuesta adaptativa estima en línea la masa, la fricción viscosa y la fricción de Coulomb mediante RLS sobre señales filtradas, y reescala su ley de control con esas estimaciones. El interés actual reside en que sirve como banco de pruebas reproducible y ligero para comparar control clásico frente a control adaptativo bajo condiciones estresadas, con métricas publicadas sobre 200 semillas por partición.

La relevancia es, por tanto, metodológica y educativa más que de producción: ofrece una comparación cuantitativa honesta (incluyendo los casos en los que el PID fijo gana) y un port a JavaScript que se ejecuta en el navegador con paridad numérica verificada frente a Node. No hay información sobre arquitectura de red neuronal, parámetros, contexto ni idiomas porque el artefacto no es un modelo generativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: controlador de simulación (PID fijo frente a control adaptativo con RLS), planta de cuerpo rígido 1-D |
| Parámetros totales | No disponible (no es un modelo neuronal; el estimador RLS mantiene un vector de 3 parámetros: masa, fricción viscosa, fricción de Coulomb) |
| Parámetros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No aplica |
| Idiomas soportados | No disponible (la documentación está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica; el repositorio contiene scripts de Python (`inference.py`), un port a JavaScript y material de presentación (`preview.png`, `replay.mp4`) |

## Arquitectura y entrenamiento

La planta simulada es un cuerpo rígido de un grado de libertad con masa base de 2,0 kg, ecuación m(z̈+g) = u(t−delay) − c·ż − F·tanh(ż/0,01), paso de integración dt = 10 ms y fuerza limitada al intervalo [0, 400] N. Ambos controladores comparten un estimador α-β (α=0,3, β=0,05) y solo conocen la carga nominal; el resto de la dinámica debe inferirse o absorberse por realimentación.

El PID fijo usa Kp=300, Ki=400, Kd=80 más una alimentación directa de la gravedad nominal. El controlador adaptativo aplica RLS con factor de olvido λ=0,99 sobre el vector [m, c, F] usando filtros de variable de estado con ω=10,0 rad/s, y calcula u = m̂(ωn²e − 2ζωn v + ki∫e + g) + ĉv con ωn=6, ζ=0,7 y ki=30. La fricción de Coulomb se estima pero no se realimenta porque produce chatter con velocidad ruidosa. El retardo del actuador se proporciona al controlador para alinear la regresión, lo que constituye una dependencia explícita del método. Ambos conjuntos de ganancias provienen de búsquedas en rejilla del mismo tamaño y coste (IAE + 0,5·energía) sobre 40 semillas de ajuste, con semillas de test disjuntas. No hay entrenamiento con datos reales ni plataforma física: todo el resultado es simulación ejecutada en NVIDIA L4.

## Capacidades

- Simulación de una plataforma de elevación 1-D con objetivo de 0,5 m aproximado mediante una rampa de 1 s que comienza en t = 0,5 s.
- Comparación lado a lado de un PID fijo y un controlador adaptativo bajo las mismas perturbaciones y semillas.
- Estimación en línea de masa, fricción viscosa y fricción de Coulomb mediante RLS con filtros de variable de estado.
- Configuración de escenarios: cambio de carga, retardo del actuador, ruido de sensor y fricción.
- Ejecución en navegador mediante un port línea a línea a JavaScript, con paridad verificada frente a Node (diferencia absoluta máxima de 8,46e-14 en 6 ejecuciones fijas).
- Ejecución por línea de comandos con `python inference.py --dm 8 --delay 4 --noise 0.003` para imprimir métricas de ambos controladores, y `--selftest` para autocomprobación.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Docencia de teoría de control: el repositorio permite mostrar en clase la diferencia entre control clásico y adaptativo con métricas reproducibles y un espacio interactivo en el que el alumnado modifica carga, retardo, ruido y fricción y vuelve a ejecutar ambos controladores en el navegador.
- Validación de metodología de comparación: sirve como plantilla para diseñar experimentos con semillas de ajuste y test disjuntas, mismo presupuesto de búsqueda de ganancias y perturbaciones idénticas para ambos controladores, evitando comparaciones sesgadas.
- Prototipado rápido de leyes de control: el script `inference.py` permite sustituir la ley adaptativa o el PID y evaluar el efecto sobre desviación máxima, tiempo de establecimiento y energía de control sin montar una planta física.
- Análisis de robustez frente a retardo: la partición de estrés incluye 88 escenarios con retardo ≥40 ms, lo que permite estudiar cómo se degrada cada controlador y en qué rango el adaptativo mantiene la tasa de establecimiento (82% frente a 51% del PID).
- Estudio del chatter en estimación de fricción de Coulomb: el diseño documenta explícitamente que F̂ no se realimenta por chatter con velocidad ruidosa, lo que constituye un caso práctico para analizar técnicas de filtrado y anti-windup.
- Material de referencia para portar simulaciones a JavaScript: la verificación de paridad numérica entre Python/Node y el navegador es un ejemplo concreto de cómo validar un port antes de publicarlo como demo interactiva.
- Evaluación de compromisos entre establecimiento y energía: los datos de energía de control (0,052 kN²·s adaptativo frente a 0,061 kN²·s PID en nominal) permiten discutir el coste energético de estrategias con tiempos de establecimiento más largos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre escenarios reservados (200 semillas por partición, mismas perturbaciones para ambos controladores):

| Split | Controlador | Desviación máxima tras cambio de carga, media / p90 (m) | Tiempo de establecimiento, mediana (s) | Establecido | Energía de control (kN²·s) |
|---|---|---:|---:|---:|---:|
| nominal | PID fijo | 0,144 / 0,283 | 1,97 | 81% | 0,061 |
| nominal | Adaptativo (Next Balance) | 0,140 / 0,263 | 5,03 | 96% | 0,052 |
| stress | PID fijo | 0,286 / 0,540 | 2,19 | 68% | 0,098 |
| stress | Adaptativo (Next Balance) | 0,292 / 0,504 | 5,10 | 90% | 0,094 |

Desglose de la partición de estrés por condición (desviación máxima media en m y tasa de establecimiento):

| Condición | n | PID | Adaptativo | PID establecido | Adaptativo establecido |
|---|---:|---:|---:|---:|---:|
| heavy_load_change (dm>4 kg) | 121 | 0,322 | 0,406 | 73% | 88% |
| load_removed (dm<0) | 10 | 0,234 | 0,035 | 20% | 100% |
| long_delay (≥40 ms) | 88 | 0,447 | 0,359 | 51% | 82% |
| high_noise (>2 mm) | 143 | 0,294 | 0,310 | 65% | 90% |

Victorias emparejadas (adaptativo mejor en el mismo escenario): desviación máxima nominal 86/200, desviación máxima en estrés 69/200 y energía en estrés 148/200. El tiempo de establecimiento se mide desde el cambio de carga hasta la última salida de la banda de ±1 cm (el cambio posterior de fricción cuenta); las ejecuciones que salen de la banda en los últimos 0,5 s se consideran no establecidas.

## Requisitos de hardware

- No se requieren GPU para la inferencia: la simulación es de cuerpo rígido 1-D con paso de 10 ms y se ejecuta en CPU sin dificultad.
- Los resultados publicados se generaron en NVIDIA L4, pero no se especifica que la GPU sea necesaria para reproducirlos.
- El port a JavaScript se ejecuta íntegramente en el navegador del usuario, sin backend.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; no se publican cifras de latencia ni throughput.
- Opciones de despliegue: ejecución local con Python (`inference.py`) y despliegue como Hugging Face Space para uso interactivo en navegador. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. Next Balance no es un modelo de lenguaje ni una red neuronal entrenada, por lo que no existen alternativas comparables en términos de parámetros, contexto o benchmarks de NLP. Como referencia metodológica, la comparación relevante es interna: PID fijo frente a controlador adaptativo RLS, cuyos resultados se detallan en la sección de benchmarks.

## Limitaciones y advertencias

- Modelo de cuerpo rígido 1-D: no contempla flexibilidad estructural, dinámica del actuador más allá de un retardo puro ni sesgo de sensor.
- El controlador adaptativo recibe el valor del retardo del actuador; con un retardo desconocido sería necesario estimarlo, lo que no se ha evaluado.
- Todos los resultados provienen de simulación; no se ha probado en una plataforma física.
- En `heavy_load_change` el PID fijo obtiene menor desviación máxima media (0,322 m frente a 0,406 m), y en `high_noise` también (0,294 m frente a 0,310 m), aunque el adaptativo establece más casos.
- El tiempo de establecimiento del adaptativo es sustancialmente mayor (mediana de 5,03 s frente a 1,97 s en nominal), lo que puede ser inaceptable en aplicaciones que prioricen respuesta rápida.
- La fricción de Coulomb se estima pero no se realimenta por chatter con velocidad ruidosa; esto limita la compensación efectiva de esa componente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas especificados, lo que indica ausencia de validación por parte de la comunidad.
- No hay información sobre sesgos, alucinación o restricciones adicionales de licencia más allá de Apache 2.0, que permite uso comercial con atribución y sin garantías.
- La fecha de creación indicada (2026-11-19) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del artefacto antes de citarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Balance
- Space interactivo: https://huggingface.co/spaces/thelamapi/Next-Balance
