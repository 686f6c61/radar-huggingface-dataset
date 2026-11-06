# xxparthparekhxx/sigma-go

## Resumen

Sigma-Go es una red neuronal de política y valor para ajedrez, exportada a ONNX, que forma parte del motor de ajedrez Sigma-Go. El modelo combina una red residual con búsqueda en árbol Monte Carlo (MCTS) y está diseñado para ejecutarse en el navegador mediante onnxruntime-web, aprovechando WebGPU o el CPU a través de WebAssembly. Lo desarrolla el usuario xxparthparekhxx y se publica bajo licencia MIT.

La red tiene 12.448.714 parámetros y una arquitectura de convolución 3×3 como tallo, seguida de 10 bloques residuales de 256 canales, con dos cabezas de salida: una de política con 4.544 logits (una por movimiento en una tabla fija) y otra de valor que estima el resultado esperado desde el punto de vista de las blancas en el rango −1…1. El archivo ONNX ocupa 47,5 MiB en fp32 con el eje de batch dinámico, lo que permite inferencia por lotes.

El modelo es relevante para desarrolladores interesados en motores de ajedrez ligeros y desplegables en entornos web, así como para quienes investigan la integración de redes neuronales con MCTS en el navegador. No obstante, su fuerza de juego no ha sido medida y se entrenó únicamente con partidas humanas, sin self-play.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual: tallo convolucional 3×3, 10 bloques residuales de 256 canales, cabezas de política y valor |
| Parametros totales | 12.448.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 14×8×8) |
| Tipos de cuantizacion | no disponible (exportado en fp32; no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, fp32, BatchNorm fusionado en las convoluciones, eje de batch dinámico) |

## Arquitectura y entrenamiento

La red es una CNN residual con un tallo de convolución 3×3 y 10 bloques residuales de 256 canales. La entrada es un tensor float32 de forma `[batch, 14, 8, 8]`: los planos 0–5 codifican las piezas blancas (peón, caballo, alfil, torre, dama, rey) y los planos 6–11 las negras; el plano 12 se activa cuando mueven las blancas y el 13 cuando mueven las negras. No hay planos para derechos de enroque, captura al paso ni historial de movimientos. La cabeza de política produce 4.544 logits correspondientes a una tabla fija de movimientos (pares from-square/to-square más promociones), y la cabeza de valor produce un escalar en −1…1 que representa el resultado esperado desde el lado de las blancas.

El entrenamiento fue supervisado con partidas humanas leídas de archivos PGN. Cada posición se etiqueta con el movimiento jugado y el resultado final de la partida. No se empleó self-play ni RLHF/DPO. El repositorio no registra qué colección de PGN se usó para entrenar este checkpoint, y la fuerza de juego del motor no ha sido medida. Como verificación de exportación, se comparó el modelo ONNX con el checkpoint de PyTorch en 96 posiciones con tamaños de lote 1, 8 y 32: las diferencias máximas fueron 1,5e-5 en los logits de política y 2,4e-7 en el valor, y ambos eligieron el mismo movimiento principal en todas las posiciones.

## Capacidades

- Evaluación de posiciones de ajedrez: produce una distribución de probabilidad sobre 4.544 movimientos legales (previa máscara de movimientos ilegales) y un valor escalar del resultado esperado.
- Inferencia en navegador: compatible con onnxruntime-web sobre WebGPU o WebAssembly (CPU).
- Integración con MCTS: la red está pensada para guiar la búsqueda en árbol Monte Carlo del motor Sigma-Go.
- Procesamiento por lotes: el eje de batch es dinámico, lo que permite evaluar varias posiciones a la vez.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües; es un modelo específico de ajedrez.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Motor de ajedrez en el navegador: el modelo puede ejecutarse con onnxruntime-web sobre WebGPU o WebAssembly, permitiendo partidas contra una IA sin instalación ni servidor, gracias a su tamaño reducido (47,5 MiB) y a la exportación ONNX optimizada.
- Análisis de posiciones en aplicaciones web educativas: la cabeza de valor ofrece una estimación del resultado esperado desde el punto de vista de las blancas, útil para mostrar evaluaciones en tiempo real en plataformas de enseñanza de ajedrez.
- Integración en motores con MCTS: el modelo sirve como red de política y valor para guiar la búsqueda en árbol Monte Carlo, tal como se implementa en `src/mcts.py` del repositorio, adecuado para proyectos que quieran experimentar con MCTS neuronal en ajedrez.
- Prototipado de motores de ajedrez ligeros: al ser un checkpoint ONNX de 12,4M de parámetros, es apto para entornos con recursos limitados, como Raspberry Pi o navegadores, donde no caben modelos mayores.
- Investigación en evaluación de redes de ajedrez: sirve como base para estudiar el comportamiento de redes entrenadas solo con partidas humanas frente a enfoques con self-play, aunque su fuerza no esté medida.
- Generación de movimientos candidatos en herramientas de análisis: la política puede usarse para sugerir movimientos legales (tras aplicar la máscara) en interfaces de análisis o entrenamiento.
- Despliegue en entornos sin GPU dedicada: la variante WebAssembly permite ejecución en CPU, útil para aplicaciones web que no pueden asumir WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la fuerza de juego no ha sido medida. Como única métrica de validación, se documenta la comparación ONNX frente a PyTorch en 96 posiciones, con diferencias máximas de 1,5e-5 en los logits de política y 2,4e-7 en el valor, y coincidencia del movimiento principal en todas las posiciones.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo ONNX ocupa 47,5 MiB en fp32; la memoria necesaria en GPU es del orden de decenas de MiB, dependiendo del tamaño de lote.
- GPU recomendadas: cualquier GPU compatible con WebGPU para ejecución en navegador; en servidor, GPU con soporte ONNX Runtime (por ejemplo, A100, H100, RTX 4090) aunque el modelo es muy pequeño y no requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; también puede ejecutarse en CPU mediante WebAssembly.
- Opciones de despliegue: onnxruntime-web (WebGPU o WebAssembly), ONNX Runtime en Python, y el motor Sigma-Go con MCTS del repositorio.
- Latencia y throughput estimados: no disponibles; no se documentan mediciones de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de ajedrez (por ejemplo, Leela Chess Zero o Stockfish NNUE), por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La fuerza de juego no ha sido medida; se desconoce su nivel real frente a otros motores.
- El entrenamiento se basó únicamente en partidas humanas, sin self-play, lo que puede limitar su rendimiento en niveles altos.
- La entrada no incluye derechos de enroque, casilla de captura al paso ni historial de movimientos; la búsqueda aplica esas reglas, pero la red no puede verlas.
- La cabeza de valor es cauta: en 54 posiciones de prueba variadas, incluidos casi mates, el 61% de sus salidas estuvieron dentro de ±0,2 y el valor máximo fue 0,82.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero la política puede asignar probabilidad a movimientos ilegales si no se aplica la máscara correspondiente antes del softmax.
- Licencia MIT: permite uso comercial, pero se recomienda conservar el aviso de copyright.
- No es un modelo de lenguaje: no soporta idiomas, tool calling ni agentes; su uso está restringido al ajedrez.
- El repositorio no documenta la colección de PGN usada, lo que dificulta la reproducibilidad del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/xxparthparekhxx/sigma-go
- Repositorio GitHub: https://github.com/xxparthparekhxx/Chess-Ai
- Tabla de movimientos (`src/dataset.py`): https://github.com/xxparthparekhxx/Chess-Ai/blob/master/src/dataset.py
- Búsqueda MCTS (`src/mcts.py`): https://github.com/xxparthparekhxx/Chess-Ai/blob/master/src/mcts.py
