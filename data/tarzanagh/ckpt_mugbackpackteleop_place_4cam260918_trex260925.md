# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_trex260925

## Resumen

T-Rex (variante sin tacto, adaptada a manos XHand1) es un checkpoint de política robótica para manipulación bimanual diestra, publicado por Davoud Ataee Tarzanagh (AI Scientist en Samsung SDS Research America, Mountain View, orientado a Physical AI) bajo el identificador `tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_trex260925`. La tarea concreta es un DexMate Vega-1 equipado con dos manos RobotEra XHand1 que sostiene una mochila abierta con la mano izquierda mientras introduce una taza en su interior con la derecha, aprendido por imitación a partir de teleoperación con meta-glove (sin exoesqueleto) y seguimiento de muñeca con Vive.

Arquitectura y tamaño: el modelo es un T-Rex compuesto por un backbone Qwen3-VL-2B más una mezcla de expertos transformer, con cascaded flow matching y FLARE, afinado desde el checkpoint midtrain ya publicado. En esta variante no hay entrada táctil: únicamente se entrena y se utiliza el experto de acciones con el flujo completo de 10 pasos. El espacio de acción es de 42 dimensiones por paso (2 × [pose de efector final de 9 dimensiones en el sistema del inicio del chunk + 12 objetivos absolutos de articulación de mano]), con chunks de 16 pasos y tres cámaras (cabeza-izquierda y ambas muñecas) a 384 × 288.

Su relevancia es metodológica más que de producto: forma parte de una familia de ejecuciones comparables sobre el mismo conjunto de datos (GR00T-N1.7-3B, Pi0, ACT, Diffusion Policy, cada una con y sin tacto) bajo un split idéntico, lo que permite aislar el efecto de la arquitectura y de la modalidad táctil en un escenario bimanual realista. El repositorio ocupa 8,4 GB, tiene licencia "other", cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | T-Rex: backbone Qwen3-VL-2B + mezcla de expertos transformer, cascaded flow matching y FLARE |
| Parámetros totales | No disponible (el backbone VLM declarado es Qwen3-VL-2B; el total no se especifica en la model card) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se distribuye el checkpoint nativo) |
| Idiomas soportados | No disponible (modelo de política robótica; no se declaran idiomas de entrada/salida) |
| Licencia | other |
| Formato de pesos | `model.pt` (checkpoint PyTorch), más `processor/`, `training_args.json` y `stats_data.json` |
| Dimensionalidad de acción | 42-D por paso = 2 × (9-D pose de efector final en el sistema del inicio del chunk + 12 objetivos absolutos de articulación de mano); chunk = 16 |
| Entradas de cámara | Cabeza-izquierda, muñeca izquierda y muñeca derecha a 384 × 288 |
| Hardware robótico objetivo | DexMate Vega-1 con dos manos RobotEra XHand1; teleoperación con meta-glove y seguimiento Vive |

## Arquitectura y entrenamiento

T-Rex combina un modelo de visión-lenguaje Qwen3-VL-2B con una mezcla de expertos transformer que actúa como experto de acción, y genera trayectorias mediante cascaded flow matching con el mecanismo FLARE. En este checkpoint concreto se parte del checkpoint midtrain publicado por el autor y se afina únicamente el experto de acción, usando el flujo completo de 10 pasos. La variante es deliberadamente "no táctil": no consume señales de los sensores de las manos, a diferencia de sus ejecuciones hermanas con sufijo `tactile`.

Los datos de entrenamiento son 31 episodios de teleoperación de la tarea descrita, repartidos en 27 de entrenamiento y 4 reservados (se retiene uno de cada diez). El ajuste se ejecutó durante 10.000 pasos con semilla 1000 y tasa de aprendizaje 1e-4, sobre 4 GPU con batch 16 por GPU (batch global 64). No se documentan en la información proporcionada ni la composición detallada del dataset, ni el número de tokens, ni si hubo fases de RLHF o DPO; tampoco se especifica el modelo de GPU utilizado.

## Capacidades

- Generación de acciones motoras bimanuales de alta frecuencia en el espacio de 42 dimensiones definido (pose de efector final más articulaciones de mano), en chunks de 16 pasos.
- Percepción visual multi-cámara: procesa simultáneamente vista de cabeza-izquierda y de ambas muñecas a 384 × 288 para condicionar la política.
- Manipulación diestra con manos robóticas de múltiples dedos (RobotEra XHand1), incluyendo objetivos absolutos de articulación por mano.
- Ejecución de una tarea bimanual asimétrica: una mano estabiliza un objeto deformable (mochila) mientras la otra realiza una inserción (taza).
- Aprendizaje por imitación a partir de teleoperación con meta-glove y seguimiento de muñeca Vive, sin exoesqueleto.
- Adaptación a un layout de acción de 42-D específico, con `tacf6_dim=3`, para la variante XHand.
- No dispone de tool calling, function calling, soporte de agentes, razonamiento multi-paso explícito, modo "thinking", ni entradas o salidas de audio; no se declaran capacidades multilingües.
- No incorpora entrada táctil: los sensores de las manos no se utilizan en esta variante.

## Casos de uso

- Investigación en manipulación bimanual diestra: sirve como política de referencia para estudiar cómo una tarea asimétrica (sostener un contenedor deformable e insertar un objeto) se resuelve con dos manos de múltiples dedos y 12 grados de libertad por mano.
- Comparación controlada de arquitecturas: al compartir dataset y split con las ejecuciones GR00T-N1.7-3B, Pi0, ACT y Diffusion Policy del mismo autor, permite aislar la contribución de la arquitectura T-Rex frente a alternativas en igualdad de condiciones.
- Ablación de modalidad táctil: emparejado con `ckpt_mugbackpackteleop_place_4cam260918_trex260925` y su equivalente táctil, permite cuantificar la ganancia de rendimiento atribuible a los sensores de la XHand1.
- Punto de partida para fine-tuning en tareas de inserción: el checkpoint ya está adaptado al layout de 42-D de la XHand, de modo que un equipo puede reentrenar el experto de acción sobre sus propios episodios de "colocar objeto dentro de contenedor" sin rehacer la adaptación de dimensionalidad.
- Análisis de error en lazo abierto: útil para estudiar la acumulación de deriva de una política de flow matching en horizontes de 16 pasos, con observación real inyectada cada 16 pasos.
- Validación de pipelines de teleoperación: los 31 episodios con meta-glove y tracking Vive sirven como caso de prueba para verificar que una cadena de captura de datos produce políticas con error de tracking aceptable.
- Reproducción de resultados: al publicarse `training_args.json` y `stats_data.json`, el checkpoint permite reproducir la configuración exacta de entrenamiento (10.000 pasos, semilla 1000, LR 1e-4, batch global 64).

## Benchmarks y rendimiento

La model card publica únicamente error en lazo abierto sobre los episodios reservados (media ± SEM), medido como |predicho − comandado| en las 12 articulaciones de cada mano (radianes) y error de posición (cm) y rotación (grados) del efector final. El modelo ve la observación real cada 16 pasos y se conservan los 16 pasos predichos.

| Métrica | Este modelo (T-Rex, sin tacto) | GR00T-N1.7-3B (sin tacto), mismo split |
|---|---|---|
| Mano izquierda (rad) | 0,0359 ± 0,0065 | 0,0085 ± 0,0003 |
| Mano derecha (rad) | 0,0389 ± 0,0037 | 0,0110 ± 0,0004 |
| Posición izquierda (cm) | 0,83 ± 0,04 | 0,76 ± 0,01 |
| Posición derecha (cm) | 1,28 ± 0,10 | 1,05 ± 0,03 |
| Rotación izquierda (grados) | 2,19 ± 0,23 | 1,61 ± 0,11 |
| Rotación derecha (grados) | 3,56 ± 0,21 | 2,44 ± 0,13 |

Advertencia explícita de la propia model card: estas cifras miden seguimiento de trayectoria, no éxito de tarea, y no se ha ejecutado nada en hardware real. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de tasa de éxito de la tarea en la información disponible.

## Requisitos de hardware

- Entrenamiento declarado: 4 GPU con batch 16 por GPU (batch global 64), 10.000 pasos. El modelo de GPU no se especifica en la información disponible.
- VRAM estimada para inferencia: no disponible como dato oficial. El repositorio ocupa 8,4 GB, cifra coherente con un checkpoint en fp32 de aproximadamente 2.000 millones de parámetros (2 B × 4 bytes ≈ 8 GB); sobre esa base, cabría esperar del orden de 10-12 GB de VRAM para la carga, pero es una estimación derivada del tamaño del repo, no un requisito publicado.
- GPU recomendadas: no disponibles. Por la estimación anterior, una RTX 4090 (24 GB) debería ser suficiente para alojar el checkpoint en fp32, y una A100 o H100 darían margen adicional, pero el dato no está confirmado por el autor.
- Compatibilidad con GPU de consumo: probable según la estimación de tamaño, no confirmada oficialmente.
- Opciones de despliegue: no se trata de un LLM y no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el código de T-Rex con la adaptación XHand (acción de 42-D, `tacf6_dim=3`); el release estándar espera el layout Sharpa de 62-D y no cargará estos pesos.
- Latencia y throughput: no disponibles. Tampoco se documenta la frecuencia de control en el robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Espacio de acción | Entrada táctil | Error mano izq. (rad) | Error mano der. (rad) | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (T-Rex XHand, sin tacto) | Backbone VLM de 2 B; total no disponible | 42-D, chunk 16 | No | 0,0359 | 0,0389 | Publicado en HuggingFace |
| GR00T-N1.7-3B (sin tacto), mismo split | 3 B (según nomenclatura) | No disponible | No | 0,0085 | 0,0110 | Ejecución comparativa publicada por el mismo autor |
| T-Rex release estándar (layout Sharpa) | Backbone VLM de 2 B; total no disponible | 62-D (`tacf6_dim=3`) | No disponible | No disponible | No disponible | Checkpoint de partida, no compatible directamente |
| Pi0 (mismo split) | No disponible | No disponible | Variante con y sin tacto | No disponible | No disponible | Ejecución comparativa publicada |
| ACT (mismo split) | No disponible | No disponible | Variante con y sin tacto | No disponible | No disponible | Ejecución comparativa publicada |
| Diffusion Policy (mismo split) | No disponible | No disponible | Variante con y sin tacto | No disponible | No disponible | Ejecución comparativa publicada |

## Limitaciones y advertencias

- Evaluación exclusivamente en lazo abierto sobre 4 episodios reservados: no hay tasa de éxito de tarea ni validación en hardware real, tal como advierte la propia model card.
- Rendimiento inferior a GR00T-N1.7-3B en todas las métricas publicadas: aproximadamente 4,2 veces peor en mano izquierda, 3,5 en mano derecha, y entre un 9 % y un 46 % peor en posición y rotación.
- Incompatibilidad de carga: el release estándar de T-Rex espera un layout de 62-D (Sharpa); estos pesos requieren la adaptación XHand de 42-D con `tacf6_dim=3`. Un intento de carga con el código de stock fallará.
- Dataset muy reducido y de una sola tarea: 31 episodios (27 de entrenamiento, 4 reservados) para un único escenario de colocar una taza en una mochila. La generalización a otros objetos, posiciones o robots no está demostrada.
- Ausencia de entrada táctil: se desperdicia la información de los sensores de la XHand1, lo que puede penalizar tareas que requieran control de fuerza o detección de contacto.
- Licencia "other": no se especifican términos de uso comercial en la información disponible. Es imprescindible consultar las condiciones del autor antes de cualquier explotación comercial.
- Idiomas, longitud de contexto y esquemas de cuantización no declarados: no se puede asumir ningún soporte multilingüe ni despliegue cuantizado.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de reproducibilidad.
- Riesgo de dependencia de la configuración de teleoperación (meta-glove y tracking Vive) y del montaje de cámaras (cabeza-izquierda y ambas muñecas a 384 × 288); cambios en esa configuración invalidan las estadísticas normalizadas de `stats_data.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_trex260925
- Ejecución hermana T-Rex (misma tarea, mismos datos): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_trex260925
- GR00T-N1.7-3B, mismo split (sin tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- GR00T-N1.7-3B, mismo split (con tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Pi0, mismo split (sin tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Pi0, mismo split (con tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- ACT, mismo split (sin tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- ACT, mismo split (con tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Diffusion Policy, mismo split (sin tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dp260925
- Diffusion Policy, mismo split (con tacto): https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_dptactile260925
- Perfil del autor en HuggingFace: https://huggingface.co/tarzanagh
- Listado de modelos del autor: https://huggingface.co/tarzanagh/models
- Página personal del autor: https://tarzanagh.github.io/
