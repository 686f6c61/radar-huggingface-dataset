# tanaysingh1/click-policy-v3

## Resumen

Click Policy v3 es un modelo vision-language-action (VLA) de 500 millones de parámetros desarrollado por tanaysingh1, orientado a una única tarea: mover el cursor del ratón y hacer clic sobre elementos de una interfaz gráfica a partir de una captura de pantalla y una instrucción en texto. Se construye sobre SmolVLM2-500M-Video-Instruct y añade una cabeza de acción basada en flow matching, siguiendo el enfoque de ShowUI-π y SmolVLA.

El modelo opera a unos 30 Hz (35-60 ms por frame en GPU de Apple M-series) y genera trozos de acción de 20 pasos, de los cuales solo ejecuta el primero antes de volver a observar la pantalla. Su tesis de investigación es que la habilidad motora de apuntar y hacer clic puede aprenderse de forma genérica sobre páginas sintéticas y transferirse a tareas nuevas con poco o ningún entrenamiento adicional.

Es relevante como primer paso de un proyecto de investigación abierto: demuestra que la inclusión explícita del cursor en la imagen y el entrenamiento del encoder visual son determinantes para el éxito en bucle cerrado (del 25% al 98% en páginas no vistas), aunque la comprensión de instrucciones nuevas sigue siendo un problema abierto. La licencia Apache 2.0 facilita su reutilización y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM2 (encoder visual + LM) con cabeza de acción flow-matching |
| Parametros totales | 500M (211M entrenables) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en fp16) |
| Idiomas soportados | no disponible (instrucciones en inglés en los ejemplos) |
| Licencia | apache-2.0 |
| Formato de pesos | .pt (checkpoint PyTorch fp16) |

## Arquitectura y entrenamiento

La arquitectura encadena el encoder visual de SmolVLM2 (entrenado durante el ajuste) que produce 60 tokens de imagen, seguido de los tokens de instrucción, las primeras 8 capas del modelo de lenguaje SmolVLM2 (entrenadas) y un expert de acción de 8 bloques construido desde cero que hace cross-attention capa a capa contra el modelo de lenguaje. En total, 211M parámetros entrenables. La imagen se letterboxea a 640×384 y se dibuja un cursor sobre ella en cada frame, de modo que el modelo siempre ve la posición de su propio puntero.

El entrenamiento utiliza 7.500 páginas web generadas aleatoriamente (fondos, fuentes, colores y layouts aleatorios, con 3-14 elementos distractores y botones Submit y Delete dibujados como texto o icono, cerca o lejos). Las trayectorias del cursor son sintéticas pero humanas: temporización según la ley de Fitts, curvas de Bézier, velocidad de jerk mínimo, overshoot y correcciones; 5 trayectorias por página y botón, aproximadamente 2M de frames de entrenamiento. El objetivo es flow matching sobre chunks de 20 pasos de deltas del cursor (escalados ×25), flags de botón y done, con 4 pasos de denoising. Se entrenó en una H100 durante aproximadamente 1 hora (detenido en el paso 7.000 de 10.000, batch 128). La evaluación se realiza en un simulador de bucle cerrado sobre páginas no vistas: éxito significa pulsar y soltar dentro del botón correcto y decir done en menos de 4 segundos desde un inicio aleatorio.

## Capacidades

- Control de ratón y clic sobre elementos de interfaz a partir de captura de pantalla e instrucción en texto.
- Generación de chunks de acción de 20 pasos `[dx, dy, button, done]` mediante flow matching con 4 pasos de denoising.
- Ejecución en bucle cerrado a ~30 Hz (35-60 ms por frame en GPU de Apple M-series).
- Generalización de la habilidad motora a páginas no vistas (98% en tareas Submit/Delete).
- Transferencia a emparejamientos de iconos no vistos juntos (flecha vs papelera, 90%).
- Seguimiento de objetivos nunca vistos (tablero de diana rojo y blanco, 12/12).
- Persecución parcial de botones que se mueven y rebotan (10/20 en el checkpoint step-5000).
- No soporta comprensión de instrucciones nuevas (colores, formas, checkboxes): en la prueba de "clic en el objetivo rojo" acierta al azar (4/12).
- No detecta el estado de éxito cuando este difiere del entrenamiento (por ejemplo, si el objetivo desaparece): nunca dice done.

## Casos de uso

- Investigación en agentes GUI: servir como banco de pruebas reproducible para estudiar la separación entre control motor y comprensión de tareas, con un coste de entrenamiento de aproximadamente 1 hora en una H100.
- Automatización de tareas repetitivas de clic en páginas web con estructura estable: el modelo puede pulsar botones Submit o Delete en páginas no vistas con un 98% de éxito, útil para pipelines de pruebas de interfaz.
- Generación de datos sintéticos de interacción: el simulador de bucle cerrado y las trayectorias humanas pueden reutilizarse para entrenar otros agentes o para aumentar datasets de computer-use.
- Evaluación de modelos VLA pequeños: al ser de 500M parámetros y con licencia Apache 2.0, permite comparar arquitecturas de cabeza de acción y estrategias de representación del cursor sin grandes presupuestos de cómputo.
- Prototipado de demos interactivas: los scripts `demo_live.py` permiten mostrar en vivo el clic sobre páginas aleatorias, útil para divulgación o validación cualitativa.
- Estudio de transferencia de habilidades motoras: el checkpoint permite reproducir los experimentos de generalización a iconos y dianas no vistos, y analizar los fallos en instrucciones novedosas.
- Base para fine-tuning en dominios concretos: al estar construido sobre SmolVLM2 y liberar solo las partes que difieren del modelo base, es un punto de partida para adaptar el control motor a otras interfaces.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (evaluación en simulador de bucle cerrado):

| Prueba | Entrenamiento visto | Resultado |
|---|---|---|
| Páginas Submit/Delete no vistas | Sí, esta tarea | 98% de éxito |
| Emparejamiento de iconos no vistos (flecha vs papelera) | No | 90% |
| Tablero de diana rojo y blanco en página en blanco | No | 12/12 |
| Botón Delete que se mueve y rebota | No | 10/20 (checkpoint step-5000) |
| "Clic en el objetivo rojo" entre otras dianas | No | ~azar (4/12) |
| Decir done cuando el éxito difiere del entrenamiento | No | nunca se detiene |

Historial de versiones del proyecto:

| Versión | Cambio | Páginas no vistas |
|---|---|---|
| v0 | baseline: visión congelada, 512², sin cursor en imagen | 25% |
| v1 | mayor resolución (1024×576) | 21% |
| v2 | posiciones absolutas + datos de grounding | 8% |
| v3 | cursor dibujado en imagen + encoder visual entrenado + letterbox + más páginas | 98% |
| v4 | fine-tune de v3 con 7 tipos de instrucción nuevos | 22% (detenido en 2k pasos) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 500M parámetros en fp16 y 211M entrenables, la inferencia cabe holgadamente en GPUs de consumo, aunque el dato exacto no se proporciona.
- GPU recomendadas: el autor reporta 35-60 ms por frame en GPU de Apple M-series; el entrenamiento se realizó en una H100.
- Cabe en GPU de consumo: sí, por tamaño (500M parámetros), aunque no se especifican modelos concretos.
- Opciones de despliegue: scripts propios del repositorio (`demo_live.py`) con PyTorch, transformers, Pillow, numpy, opencv-python y Playwright; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 35-60 ms por frame (~30 Hz) en GPU de Apple M-series.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Click Policy v3 | 500M (211M entrenables) | no disponible | Point-and-click GUI | Apache 2.0 | Hugging Face |
| SmolVLM2-500M-Video-Instruct (base) | 500M | no disponible | Visión-lenguaje general | no disponible en la información | Hugging Face |
| ShowUI-π | no disponible | no disponible | GUI agent (referencia) | no disponible | paper arXiv:2512.24965 |
| SmolVLA | no disponible | no disponible | Vision-language-action (referencia) | no disponible | paper arXiv:2506.01844 |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Comprensión de instrucciones nuevas muy limitada: en la prueba de color ("clic en el objetivo rojo") acierta al azar (4/12) e ignora la palabra de color.
- No detecta el estado de éxito cuando este difiere del entrenamiento: si el objetivo desaparece en lugar de cambiar de estado, el modelo nunca dice done.
- Seguimiento de objetos en movimiento parcial: solo 10/20 en el botón que rebota (checkpoint step-5000).
- Entrenado exclusivamente sobre páginas web sintéticas con botones Submit y Delete; la generalización a interfaces reales complejas no está demostrada.
- El fine-tuning con nuevas instrucciones (v4) aprendió lentamente y se detuvo en 2k pasos con un 22% en páginas no vistas.
- No es un agente terminado: el propio autor lo describe como un primer paso de un proyecto de investigación.
- Riesgo de alucinación no evaluado en la información disponible; el modelo genera acciones, no texto libre, por lo que el riesgo se manifiesta como clics erróneos.
- Sesgos conocidos: no documentados en la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base SmolVLM2 puede tener sus propias condiciones que conviene verificar.
- En producción requeriría mecanismos externos de verificación de éxito y de parada, dado que el flag done no es fiable fuera de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanaysingh1/click-policy-v3
- Modelo base SmolVLM2-500M-Video-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Paper ShowUI-π: https://arxiv.org/abs/2512.24965
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Paper adicional referenciado: https://arxiv.org/abs/2410.24164
