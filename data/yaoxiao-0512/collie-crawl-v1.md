# yaoxiao-0512/collie-crawl-v1

## Resumen

`collie-crawl-v1` es una política de locomoción (no un modelo de lenguaje) para el robot cuadrúpedo BorderCollie a escala 0,42×, con 14 grados de libertad: 12 articulaciones de patas y 2 de columna. La desarrolla el usuario `yaoxiao-0512` y resuelve una tarea concreta: mantener una postura de reptado baja (altura de base objetivo de 0,12 m) mientras avanza a entre 0,05 y 0,3 m/s durante episodios de 20 s, esquivando dos barras estáticas tipo limbo en la escena.

El interés técnico está en cómo se ha obtenido: no es un transformer ni un modelo generativo, sino un controlador entrenado con EUREKA, un procedimiento de búsqueda de recompensas guiado por LLM, partiendo como *relay* del campeón de la habilidad `lie_down` (postura prona). El campeón alcanza un *fitness* de 2,3736 frente a una línea base de 0,40 y un techo teórico de 3,0, es decir, un 79 % del máximo. La descomposición oficial del evaluador muestra que su punto fuerte es el mantenimiento de altura (`base_height` en 0,85) y su margen de mejora está en el seguimiento de velocidad (`track_lin_vel` en 0,65), por el compromiso entre postura baja y avance.

La relevancia práctica es que se distribuye como grafo ONNX autónomo (con el normalizador de observaciones integrado en el grafo), lo que permite ejecutarlo en el cómputo embarcado del robot sin dependencia de frameworks de RL. Ahora bien, la licencia de los pesos es CC-BY-SA-NC 4.0, lo que bloquea el uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control neuronal exportada a ONNX, con normalizador de observaciones integrado en el grafo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: control paso a paso con observación de 61 dimensiones; episodios de 20 s |
| Tipos de cuantizacion | no disponible (solo se publica el grafo ONNX) |
| Idiomas soportados | no aplica |
| Licencia | Código: Apache-2.0. Pesos: CC-BY-SA-NC 4.0 |
| Formato de pesos | ONNX (`crawl_policy.onnx` + pesos externos `crawl_policy.onnx.data`) y `crawl_policy.reference.json` |
| Tarea | `Collie-Crawl-Flat`: reptado con postura baja y avance frontal |
| Grados de libertad | 14 (12 articulaciones de pata + 2 de columna) |
| Entrada | tensor `[1, 61]` de observación normalizada (normalizador incluido en el grafo) |
| Salida | tensor `[1, 14]` de objetivos de posición articular |
| Ganancias PD | Kp 8,0 / Kd 0,2 |
| Altura de base objetivo | 0,12 m |
| Velocidad de avance | 0,05–0,3 m/s |
| Obstáculos en escena | barra fácil en x = 2,5 m (0,20 m de holgura); barra difícil en x = 4,5 m (0,15 m de holgura) |
| Fitness del campeón | 2,3736 (línea base 0,40; techo teórico 3,0) |
| Tamano del repo | 0,0 GB (según HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 19 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card no documenta la topología interna de la red (número de capas, anchura, función de activación). Lo que sí se especifica es el contrato de despliegue: un grafo ONNX que consume un vector de 61 observaciones ya normalizadas (el normalizador está horneado en el propio grafo, lo que elimina una fuente habitual de errores de integración) y emite 14 objetivos de posición articular que se envían a un lazo de control PD con Kp 8,0 y Kd 0,2. El paquete se completa con un JSON de 64 fotogramas de referencia, útil para validar la integración antes de mover hardware real.

El entrenamiento se realizó con EUREKA, un esquema de búsqueda de recompensas guiado por LLM, en su etapa 1 (exploración, sigma 0,05): 3 de 3 iteraciones completadas, 24 candidatos evaluados y 0 fallos. El punto de partida fue el campeón de `collie-lie-down-v1` (checkpoint `2026-10-16_06-49-50_eureka_c6743d11/model_299.pt`), de modo que la política hereda una prior de postura prona y aprende a partir de ahí el patrón de reptado. La función de recompensa del campeón pondera `track_lin_vel` 1,5, `base_height` 1,5, `flat_orientation` 1,0, `undesired_contacts` 0,5, `gait_phase` 0,4, `termination` 0,4, `stride_frequency` 0,3, `diagonal_force_symmetry` 0,2, `front_back_symmetry` 0,2, `feet_air_time` 0,1, `feet_slip` 0,1, `spine_torque` 0,1, `action_rate` 0,05 y `action_smoothness` 0,05. No se indica el número de pasos de entorno, la composición del dataset ni si hubo ajuste posterior tipo RLHF (no aplicable en este dominio).

## Capacidades

- Locomoción de reptado con altura de base controlada en torno a 0,12 m, mantenida durante episodios de 20 s.
- Avance frontal a velocidades bajas, en el rango de 0,05 a 0,3 m/s.
- Paso bajo obstáculos tipo barra de limbo con dos niveles de holgura (0,20 m y 0,15 m), en escena plana.
- Coordinación de 12 articulaciones de pata más 2 de columna, con simetría diagonal y frontal penalizada en la recompensa si se rompe.
- Control de contacto indeseado (`undesired_contacts` 0,5) y de deslizamiento de pies (`feet_slip` 0,1), orientado a tracción estable en postura baja.
- Ejecución en tiempo real vía ONNX Runtime: el normalizador va incluido en el grafo, por lo que la observación se puede pasar en bruto.
- Validación offline contra 64 fotogramas de referencia (`crawl_policy.reference.json`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un controlador reactivo específico de tarea.

## Casos de uso

- **Inspección bajo maquinaria industrial**: el robot puede atravesar huecos de 0,15–0,20 m de altura libre para revisar la parte inferior de cintas transportadoras o bancos de mecanizado, donde un cuadrúpedo en postura normal no entra. La política está entrenada exactamente para ese régimen de altura y velocidad lenta.
- **Vigilancia de cableado y tuberías en salas técnicas**: con 20 s de episodio y velocidades de 0,05–0,3 m/s, encaja en rutas cortas de inspección repetitiva bajo obstáculos fijos; la barra de 2,5 m y la de 4,5 m sirven como referencia de calibración de la escena.
- **Búsqueda y rescate en escombros con oquedades bajas**: permite explorar huecos estrechos donde el robot no puede erguirse, manteniendo la orientación plana (`flat_orientation` en el techo de la recompensa) para no engancharse.
- **Base para un currículum de habilidades**: al ser un *relay* del campeón de `lie_down`, sirve como eslabón intermedio para construir habilidades posteriores (levantarse, saltar, gatear bajo obstáculos móviles) reutilizando el mismo contrato de 61→14 y las mismas ganancias PD.
- **Agricultura de precisión en invernadero**: muestreo de humedad o temperatura a ras de suelo entre hileras de cultivo bajo, donde la altura de trabajo debe mantenerse por debajo de 0,2 m.
- **Investigación en RL y búsqueda de recompensas**: el paquete incluye la ponderación exacta de la recompensa y la descomposición por término, lo que lo convierte en un punto de comparación reproducible para experimentos con EUREKA u otros métodos de *reward shaping*.
- **Validación de pipelines sim2real**: el JSON de 64 fotogramas de referencia y el grafo ONNX permiten verificar la cadena de observación y el lazo PD en el robot antes de desplegar políticas más arriesgadas.
- **Docencia y robótica de bajo coste**: al ejecutarse en ONNX Runtime sobre CPU, se puede integrar en plataformas embarcadas sin GPU para prácticas de control y RL aplicado.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas internas del evaluador de la tarea (`Collie-Crawl-Flat`), no benchmarks estándar de IA (MMLU, HumanEval, GSM8K no aplican a este modelo).

| Metrica | Valor | Notas |
|---|---|---|
| Fitness total | 2,3736 | Línea base 0,40; techo teórico 3,0; 79 % del techo |
| `base_height` (raw) | 0,85 | Punto fuerte, con bonus de relevo de `lie_down` |
| `track_lin_vel` (raw) | 0,65 | Margen de mejora: compromiso postura baja / velocidad |
| `flat_orientation` (raw) | −0,01 | En el techo (el término está acotado a ≤ 0) |
| Iteraciones EUREKA | 3/3 | Etapa 1, exploración con sigma 0,05 |
| Candidatos evaluados | 24 | 0 fallidos |

No se han publicado resultados de benchmarks en la informacion disponible para comparación con otras políticas de locomoción.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. El repositorio declara 0,0 GB, lo que sitúa el paquete por debajo de los 100 MB; una política con entrada de 61 y salida de 14 es de tamaño muy reducido y no requiere GPU dedicada.
- GPU recomendadas: ninguna imprescindible. Cualquier GPU (RTX 4090, A100, H100) sobra para el grafo; el despliegue realista es CPU.
- Cabe en hardware de consumo: sí, con alta probabilidad en Raspberry Pi 5, Jetson Nano u Orin Nano, y en cualquier CPU x86 moderna mediante ONNX Runtime. No se publica el consumo exacto por inferencia.
- Opciones de despliegue: ONNX Runtime (ruta documentada implícitamente por el formato), integración directa en el lazo de control del robot con ganancias PD Kp 8,0 / Kd 0,2. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La tarea define episodios de 20 s, pero no se especifica la frecuencia de control ni el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo / tarea | Entrenamiento | Formato | Licencia | Datos clave |
|---|---|---|---|---|---|
| `collie-crawl-v1` | Reptado con postura baja y obstáculos limbo | EUREKA etapa 1, desde campeón `lie_down` | ONNX (+ JSON de referencia) | Pesos CC-BY-SA-NC 4.0; código Apache-2.0 | Fitness 2,3736; 61→14; Kp 8,0 / Kd 0,2 |
| `collie-jump-v1` | Salto, altura máxima | PPO en MuJoCo (2026-10-08) | PyTorch `.pt` | MIT (según la ficha indexada) | Recompensa `jump_apex` 1,05; checkpoint `jump_v4_model_299.pt` |
| `collie-getup-v1` | Incorporación desde el suelo | no disponible | no disponible | no disponible | No hay especificaciones publicadas en la información disponible |
| `collie-lie-down-v1` | Postura prona (prior del reptado) | EUREKA (checkpoint `model_299.pt`) | PyTorch `.pt` | no disponible | Usado como punto de partida de `collie-crawl-v1` |

Las diferencias de licencia son relevantes: `collie-crawl-v1` es el único de la familia con pesos no comerciales, mientras que `collie-jump-v1` figura como MIT. Tampoco coinciden los formatos: solo `collie-crawl-v1` se exporta a ONNX con el normalizador embebido, lo que simplifica el despliegue frente a los `.pt` de las otras variantes.

## Limitaciones y advertencias

- **Licencia no comercial**: los pesos se publican bajo CC-BY-SA-NC 4.0, lo que excluye el uso comercial y obliga a compartir obras derivadas bajo la misma licencia. El código es Apache-2.0, pero la política entrenada no lo es. Verificar antes de cualquier despliegue en producto.
- **Alcance de tarea muy estrecho**: solo terreno plano, dos barras estáticas en posiciones fijas (x = 2,5 m y x = 4,5 m) y una ventana de velocidad de 0,05–0,3 m/s. No hay evidencia de generalización a obstáculos móviles, pendientes, escalones ni superficies deslizantes.
- **Compromiso postura-velocidad**: el propio autor señala `track_lin_vel` en 0,65 como el término con margen. Cabe esperar error en el seguimiento de consigna de velocidad, especialmente en el extremo alto del rango.
- **Dependencia dura del contrato de observación**: la política espera exactamente 61 dimensiones normalizadas; el normalizador va embebido, así que un orden de sensores distinto o una calibración desviada invalida la salida sin aviso evidente. Los 64 fotogramas de referencia son el único mecanismo de verificación provisto.
- **Sin capa de seguridad ni recuperación documentada**: no se describe comportamiento ante caída, atasco o contacto no modelado. La recompensa penaliza `undesired_contacts` y `termination`, pero no se publica una política de recuperación asociada; existiría `collie-getup-v1` como habilidad separada, sin integración documentada.
- **Sim2real no cuantificado**: no se publican resultados en hardware físico, ni latencias, ni tasas de éxito en robot real. El salto de simulación a realidad queda sin validar en la información disponible.
- **Específico de plataforma**: los 14 DoF y la escala 0,42× del BorderCollie condicionan las ganancias PD y las longitudes de pata; no es transferible a otro cuadrúpedo sin reentrenamiento.
- **Sesgos**: no aplican sesgos sociales propios de un LLM; el sesgo relevante es de simulación (dinámica, fricción y ruido de sensores del modelo de entrenamiento).
- **Madurez**: 0 descargas y 0 likes, publicada y actualizada el mismo día (19 de octubre de 2026), sin pipeline declarado ni idiomas. Tratar como artefacto de investigación, no como componente endurecido para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yaoxiao-0512/collie-crawl-v1
- Modelo hermano (salto): https://huggingface.co/yaoxiao-0512/collie-jump-v1
- Modelo hermano (incorporación): https://huggingface.co/yaoxiao-0512/collie-getup-v1

Nota: el resto de resultados de la búsqueda web (calendarios de lanzamientos de LLM y un tutorial sobre una herramienta de automatización de navegador llamada Collie) no guardan relación con este modelo y se han descartado. No se han encontrado en la información proporcionada artículos, papers ni repositorios adicionales específicos de `collie-crawl-v1`.
