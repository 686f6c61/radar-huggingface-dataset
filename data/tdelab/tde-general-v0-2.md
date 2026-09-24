# tdelab/tde-general-v0.2

## Resumen

TDE general v0.2 es un modelo de decisión tipada (typed-decision encoder) desarrollado por tdelab. Se construye sobre un encoder transformer de tipo ModernBERT-base de aproximadamente 150 millones de parámetros (150.208.513 según los pesos en safetensors) con un cabezal de lectura de tipo pointer readout. No es un modelo generativo al uso: recibe en una sola pasada una tupla formada por un estado, una pregunta y un conjunto de candidatos, y devuelve una probabilidad calibrada por cada candidato, convirtiendo problemas de clasificación o de elección entre opciones en una decisión tipada.

La versión v0.2 parte de tde-general-v0.1 y se afina adicionalmente para jugar al Snake a partir de un tablero en texto plano, manteniendo a la vez sus capacidades de decisión generales. Es relevante como demostración de un enfoque poco habitual: reutilizar un encoder de clasificación calibrada como política de decisión en un entorno de juego, con un coste de inferencia muy bajo (unos 12 ms por movimiento con MLX en un M5 Pro).

El interés técnico reside en la combinación de un modelo compacto, una interfaz de decisión tipada y un escudo anti-trampa externo que evita los auto-encierros de la serpiente. La licencia es Apache 2.0, el único idioma soportado es el inglés y la librería de referencia es MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base) con cabezal de tipo pointer readout para decisión tipada |
| Parametros totales | 150.208.513 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de la familia ModernBERT-base con un cabezal de lectura de tipo pointer readout. El modelo no genera texto token a token: en una única pasada sobre la concatenación de estado, pregunta y candidatos produce una probabilidad por candidato. La interfaz se denomina decisión tipada (typed decisions) e incluye tipos como "choice", con instrucciones y criterios asociados a cada opción. Esta formulación permite obtener clasificación calibrada (con métrica NLL) además de la etiqueta ganadora.

El entrenamiento de v0.2 se inicializa desde tde-general-v0.1 y se afina durante 2 épocas (6.250 pasos de tamaño 32) sobre 100.000 posiciones de Snake extraídas de tableros de 8x8, 12x12 y 24x16, cada una etiquetada con los movimientos de un planificador de camino más corto que garantiza que la cola siga siendo alcanzable. El ajuste se realizó con MLX en un solo Mac en unos 80 minutos, mediante los scripts `integrations/snake/build_sft.py` y `tde/mlx/train.py`. No se menciona en la información disponible el uso de RLHF, DPO ni de un corpus de texto general adicional. La innovación destacable es el escudo anti-trampa (anti-trap shield), que veta un movimiento cuando tras él la cabeza ya no puede alcanzar su cola y toma la siguiente elección del modelo.

## Capacidades

- Decisión tipada y clasificación calibrada: una pasada sobre `estado + pregunta + candidatos` devuelve una probabilidad por candidato, con métricas de accuracy y NLL.
- Elección entre opciones ("choice"): la interfaz admite instrucciones y criterios, por ejemplo los cuatro movimientos posibles en Snake.
- Decisiones generales: evaluación sobre 7 datasets públicos con una muestra de 2.000 ítems (accuracy del 86,4%).
- Juego de Snake desde un tablero en texto plano: el estado se codifica con un token por celda (` .` vacío, ` F` comida, ` H` cabeza, ` 1`–` 9` cuerpo, indicando los movimientos hasta que la celda quede libre) bajo una línea con longitud y rumbo.
- Integración con un escudo anti-trampa externo para evitar auto-encierros.
- Capacidades multilingües: no disponible (solo inglés).
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible (no se describe soporte explícito).
- Visión, audio o modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Clasificación con probabilidades calibradas: dado un estado y un conjunto de etiquetas candidatas, el modelo devuelve una probabilidad por etiqueta y una métrica de confianza (NLL), lo que permite usarlo en tareas de enrutado o triaje donde importa no solo la etiqueta sino la certeza.
- Respuesta a preguntas de elección múltiple: el formato de decisión tipada encaja directamente con preguntas con opciones discretas, reutilizando la interfaz de "choice" con instrucciones y criterios.
- Política de decisión en entornos de juego: la integración con Snake muestra cómo un encoder compacto puede actuar como política paso a paso (unos 12 ms por movimiento con MLX en un M5 Pro) alimentada con el estado en texto.
- Evaluación de planificación y seguridad de políticas: el escudo anti-trampa permite estudiar el efecto de una restricción externa sobre las decisiones del modelo, comparando su rendimiento con y sin él (38,75 frente a 21,75 comidas de media por partida en el protocolo descrito).
- Investigación en clasificación calibrada y decisiones tipadas: sirve como banco de pruebas para comparar formulaciones de "state + question + candidates" frente a modelos generativos en tareas de elección.
- Prototipado en hardware de Apple: al ejecutarse con MLX, permite desarrollar y depurar en un Mac sin GPU dedicada, lo que facilita iterar sobre el pipeline de decisión antes de desplegarlo en otros entornos.
- Filtrado o anotación automatizada por criterios: la interfaz de criterios por candidato permite aplicar reglas de decisión explícitas y obtener una distribución de probabilidad sobre las opciones, útil para preselección de datos.

## Benchmarks y rendimiento

Protocolo del juego de Snake (demo laya-mlx: tablero 24x16, longitud 6, semillas 101–104, 600 movimientos):

| Configuracion | Comida por partida | Supervivencia |
|---|---|---|
| tde-general-v0.2 con escudo anti-trampa | 39 · 38 · 40 · 38 (media 38,75) | 4 de 4 |
| tde-general-v0.2 sin escudo | 27 · 18 · 13 · 29 (media 21,75) | 0 de 4 |
| laya-mlx tal como se publicó (features del planificador y escudo de ciclo hamiltoniano) | 20 · 24 · 23 · 16 (media 20,75) | 4 de 4 |

Decisiones generales (test en distribución: 7 datasets públicos, muestra de 2.000 ítems):

| Version | Accuracy | NLL |
|---|---|---|
| tde-general-v0.1 | 87,4% | 0,313 |
| tde-general-v0.2 | 86,4% | 0,336 |

JevBench y el test de decisiones tipadas no se volvieron a ejecutar para este checkpoint. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento de parámetros, 150.208.513): unos 600 MB en FP32, unos 300 MB en FP16/BF16, unos 150 MB en int8 y unos 75 MB en int4, más el coste de activaciones.
- Cabe en cualquier GPU de consumo actual, así como en memoria unificada de Apple Silicon; no requiere GPU de centro de datos.
- GPU de referencia recomendadas: cualquiera con más de 1–2 GB de VRAM libre sirve; no se especifica un modelo concreto (A100, H100, RTX 4090, etc.) en la información disponible.
- Despliegue: la librería declarada es MLX; el ejemplo de uso es `Decider.from_run("tdelab/tde-general-v0.2")` del paquete `tde` (`pip install git+https://github.com/e13ven-arch/tde`). El autor reporta unos 12 ms por movimiento con MLX en un M5 Pro para el caso de Snake. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Tamaño del repositorio: 1,2 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tde-general-v0.2 | 150.208.513 | no disponible | 86,4% accuracy y 0,336 NLL en el test general en distribución; 38,75 comidas de media con escudo en Snake | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| tde-general-v0.1 (modelo base) | ~150M (mismo encoder según la ficha) | no disponible | 87,4% accuracy y 0,313 NLL en el test general en distribución; no se reporta resultado en Snake | apache-2.0 | HuggingFace |
| ModernBERT-base (arquitectura de referencia) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| laya-mlx (sistema de referencia en Snake, no es un modelo equivalente) | no disponible | no disponible | 20,75 comidas de media en el protocolo descrito | no disponible en la informacion proporcionada | Repositorio de referencia citado como "as published" |

No se dispone de datos de comparación directa con otros modelos de decisión tipada o de clasificación calibrada en la información proporcionada.

## Limitaciones y advertencias

- Sin el escudo anti-trampa, la serpiente acaba encerrándose: las cuatro partidas del protocolo terminan antes del movimiento 600 (0 de 4 supervivientes).
- La accuracy general cae aproximadamente un punto respecto a v0.1 (86,4% frente a 87,4%) y la NLL empeora (0,336 frente a 0,313), lo que sugiere un cierto compromiso al afinar para Snake.
- La ficha indica que las limitaciones de v0.1 se aplican sin cambios, pero dichas limitaciones no están enumeradas en la información disponible; conviene consultar la model card de tde-general-v0.1.
- Idioma: solo inglés (en), lo que restringe su uso en castellano u otros idiomas.
- No hay datos sobre sesgos conocidos, comportamiento ante entradas fuera de distribución ni riesgo de alucinación; aunque el modelo no genera texto libre, sí produce probabilidades que pueden estar mal calibradas en dominios alejados del entrenamiento.
- No se han vuelto a ejecutar JevBench ni el test de decisiones tipadas para este checkpoint, por lo que faltan métricas de referencia.
- Adopción muy baja (0 descargas y 0 likes en el momento de la consulta) y ausencia de validación independiente.
- Restricciones de licencia para uso comercial: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el cumplimiento de las dependencias del repositorio de código y de la arquitectura base.
- La fecha de creación y actualización registrada (2026-09-24) debe tenerse en cuenta al evaluar la trazabilidad del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tdelab/tde-general-v0.2
- Modelo base tde-general-v0.1: https://huggingface.co/tdelab/tde-general-v0.1
- Repositorio de código: https://github.com/e13ven-arch/tde
- Tutorial de la integración con Snake: https://github.com/e13ven-arch/tde/tree/main/integrations/snake
- Script de construcción del SFT citado en la ficha: `integrations/snake/build_sft.py` (dentro del repositorio anterior)
- Script de entrenamiento citado en la ficha: `tde/mlx/train.py` (dentro del repositorio anterior)
- Demo de Snake citada en la ficha: `python -m integrations.snake.demo` (dentro del repositorio anterior)
