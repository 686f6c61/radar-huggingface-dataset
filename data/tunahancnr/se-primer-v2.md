# TunahanCnr/se-primer-v2

## Resumen

SE Primer v2 es un clasificador tabular binario muy compacto, publicado por TunahanCnr, que estima la probabilidad de que un jugador elija la opcion de alto coste (denominada B) al entrar en una escena concreta de un juego educativo de ingenieria del software. El escenario simulado consiste en tres decisiones encadenadas sobre un sistema de citas hospitalarias que cae a las 08:00; el modelo predice el riesgo de decision costosa antes de que el jugador actue, y si la probabilidad supera 0,5 el juego activa una intervencion pedagogica (tarjeta de pista, retirada del temporizador de 60 segundos y pregunta de reflexion del tutor).

Tecnicamente no es un modelo de lenguaje ni una red neuronal profunda: es un pipeline de scikit-learn compuesto por `StandardScaler` y `LogisticRegression` con `class_weight="balanced"` y `random_state=13`, exportado a ONNX. La entrada es un vector float32 de 11 caracteristicas conocidas en el momento de entrar en la escena (nivel, numero de escena, coincidencia con el objetivo, repeticion de partida, tiempos y contadores de la escena anterior), y la salida son dos probabilidades. El repositorio pesa 0,0 GB y no incluye pesos en safetensors ni GGUF.

Su relevancia es acotada pero ilustrativa: documenta un ciclo completo de evaluacion con puertas de calidad predefinidas, un conjunto de test recogido despues del entrenamiento y una version anterior (v2.0) rechazada por no superar dichas puertas. Es un ejemplo de modelado tabular aplicado a un dominio educativo de nicho, no una herramienta general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: StandardScaler + LogisticRegression (clasificacion binaria), exportado a ONNX |
| Parametros totales | 11 coeficientes mas intercepto (no disponible el recuento exacto en la informacion proporcionada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 11 caracteristicas) |
| Tipos de cuantizacion | no disponible (modelo ONNX float32; no se documentan cuantizaciones) |
| Idiomas soportados | tr (turco); el modelo no procesa texto, la etiqueta de idioma es declarativa |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`); entrada `input` float32 `[n, 11]`, salida `probabilities` `[n, 2]` |

## Arquitectura y entrenamiento

La arquitectura es un clasificador lineal sobre caracteristicas estandarizadas. El pipeline aplica `StandardScaler` a las 11 variables de entrada y despues una regresion logistica con ponderacion de clases balanceada. El autor reporta que la diferencia maxima entre la salida de sklearn y la salida ONNX es de 8,05e-08, lo que confirma una exportacion fiel. El entorno de entrenamiento declarado es Python 3.14, scikit-learn 1.9.1 y skl2onnx 1.20.0.

El entrenamiento se realizo con 31 sesiones reales y 93 decisiones recogidas en un modo de recogida de datos. El conjunto de test se recogio despues del entrenamiento y consta de 17 sesiones y 51 decisiones, con 11 casos de clase B, sin reutilizacion en el ajuste. Se generaron ademas 100 sesiones sinteticas con un generador basado en reglas (semilla 13), pero no se usaron en el entrenamiento de la v2.1: el autor indica que las suposiciones del generador entraban en conflicto con los datos reales (en partidas repetidas los jugadores casi siempre elegian A), por lo que el dato sintetico se excluyo del ajuste y quedo solo como prueba del pipeline. No se documenta uso de RLHF, DPO ni tecnicas de ajuste fino adicionales.

## Capacidades

- Clasificacion binaria tabular: estima la probabilidad de que el jugador elija la opcion B en una escena concreta.
- Prediccion previa a la accion: la inferencia se realiza en el momento de entrada a la escena, con informacion disponible antes de la decision.
- Integracion en el bucle de juego: la salida `p >= 0.5` dispara la intervencion pedagogica definida por el autor.
- Entrada con orden fijo de 11 caracteristicas (nivel, escena, objetivo, repeticion, tiempos y contadores previos).
- Exportacion ONNX para ejecucion en navegador o en entornos con runtime ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.
- No dispone de capacidades multilingues: la etiqueta `tr` es declarativa y no implica procesamiento de lenguaje.

## Casos de uso

- Intervencion adaptativa en el juego SE Primer: al entrar en una escena, el cliente descarga `model.onnx` desde una URL fijada a un commit, calcula `p` y, si supera 0,5, abre la tarjeta de pista y muestra la pregunta de reflexion del tutor antes de que el jugador responda.
- Ajuste del andamiaje pedagogico por nivel: la caracteristica `seviere` (nivel 0, 1 o 2) permite modular la frecuencia de intervencion segun la experiencia declarada del jugador.
- Investigacion sobre decision-making en educacion en ingenieria del software: el modelo sirve como artefacto reproducible para estudiar la relacion entre tiempos de entrada, cambios de respuesta y eleccion de opciones costosas.
- Deteccion de partidas de exploracion: la variable `tekrar_oyun` permite distinguir partidas repetidas, donde una `p` alta puede reflejar curiosidad (ver el mal final) y no riesgo real, y tratar esos casos de forma diferenciada.
- Prototipado de sistemas de alerta temprana en entornos de formacion: el patron (vector de 11 caracteristicas, salida probabilistica, umbral fijo) es reutilizable en otros simuladores educativos con decisiones discretas.
- Referencia metodologica para equipos pequenos: el repositorio documenta puertas de evaluacion (ROC-AUC ≥ 0,65, sensibilidad B ≥ 0,6), un conjunto de test recogido tras el entrenamiento y el rechazo razonado de una version anterior, lo que lo hace util como plantilla de validacion.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test retenido (17 sesiones, 51 decisiones, 11 casos de clase B):

| Metrica | Valor | Puerta |
|---|---|---|
| ROC-AUC | 0,7148 (IC 95 % 0,5-0,8492, bootstrap por sesion) | ≥ 0,65 |
| Sensibilidad a B (p ≥ 0,5) | 0,8182 | ≥ 0,6 |
| Precision de B | 0,375 | no definida |
| Exactitud | 0,6667 | no definida |
| Tasa de intervencion | 0,4706 | no definida |

El resultado global de las puertas es "GEÇTI" (superado). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: negligible; el modelo es una regresion logistica de 11 entradas y cabe en pocos kilobytes.
- GPU recomendadas: no requiere GPU; la inferencia puede ejecutarse en CPU o en el runtime ONNX del navegador.
- Cabe en cualquier GPU de consumo y tambien en CPU de gama baja, telefonos y entornos web.
- Opciones de despliegue: ONNX Runtime (web, Python, C++), integracion directa en el cliente del juego mediante URL fijada a commit; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI porque no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (una multiplicacion matriz-vector de 11 dimensiones) se espera un coste despreciable frente al resto del bucle de juego, pero no se aportan medidas.

## Comparativa con modelos similares

No se dispone de modelos comparables en la informacion proporcionada. Se trata de un clasificador tabular de dominio especifico y no de un modelo de lenguaje, por lo que las comparaciones habituales (parametros, contexto, benchmarks de razonamiento) no son aplicables. Como referencia interna, la version anterior v2.0 no supero las puertas de evaluacion (ROC-AUC 0,618 y 0,643) y fue rechazada, segun `RELEASE.md`.

## Limitaciones y advertencias

- Muestra de evaluacion muy pequena (17 sesiones, 51 decisiones, 11 casos B); el intervalo de confianza del ROC-AUC baja hasta 0,50, es decir, el nivel de una moneda al aire.
- La mayoria de los jugadores de test habian jugado antes el escenario, por lo que la medicion no representa bien a un jugador novel.
- Parte de los jugadores de test son las mismas personas que en entrenamiento; la separacion es por sesion, no por persona.
- La poblacion son companeros de clase de ingenieria del software; no generaliza a otras audiencias.
- En partidas con "volver a jugar", el jugador conoce el escenario y puede elegir B deliberadamente para ver el mal final: una `p` alta puede significar exploracion y no riesgo.
- El modelo predice la eleccion de B, no explica su causa; no debe interpretarse como diagnostico del comportamiento.
- Uso prohibido segun el autor: calificar o clasificar al jugador, tomar decisiones sobre su capacidad, o aplicar el modelo fuera del escenario SE Primer (por ejemplo, en seleccion de personal o intervencion sobre sucesos reales).
- El modelo se descarga en el navegador y es publico: no debe usarse para logica que deba permanecer secreta.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor restringe explicitamente los usos anteriores por motivos eticos, no por la licencia.
- El modelo no procesa lenguaje natural; la etiqueta de idioma `tr` no implica capacidades linguisticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TunahanCnr/se-primer-v2
- Repositorio de codigo, entrenamiento y tests: https://github.com/TunahanCnrYildiz/se-primer-v2
- Descarga del modelo fijada a commit: https://huggingface.co/TunahanCnr/se-primer-v2/resolve/<commit>/model.onnx
- Documento de release y rollback: `RELEASE.md` en el repositorio de GitHub
