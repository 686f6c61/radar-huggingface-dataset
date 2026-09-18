# unitreerobotics/UnifoLM-ER-Flow

## Resumen

UnifoLM-ER-Flow es un modelo de visión-lenguaje-acción (VLA) desarrollado por Unitree Robotics (organización `unitreerobotics` en HuggingFace), publicado bajo licencia Apache 2.0 y distribuido en safetensors. Con 4.447.303.168 parámetros (unos 4,45 mil millones) y un repositorio de 9,7 GB, se construye sobre una arquitectura de tipo Qwen3-VL, según la etiqueta `qwen3_vl` del repositorio, y extiende el modelo previo UnifoLM-ER-1.

Su aportación principal es doble: por un lado, un modelado de mundo centrado en la interacción que predice las regiones dinámicas futuras de la escena (extraídas previamente con flujo óptico y codificadas con un VQ-VAE en secuencias de tokens discretos); por otro, un esquema de aprendizaje de acciones discretas en el que el espacio de acción se divide en tres componentes (poses del efector final, articulaciones del efector final y articulaciones del tren inferior), cada uno discretizado con su propio modelo de cuantización residual (RVQ).

El modelo alinea en un único VLM observaciones visuales, condiciones de lenguaje, regiones dinámicas futuras y acciones de robot, lo que lo sitúa en la intersección entre los modelos de mundo y las políticas robóticas entrenadas por imitación. Es relevante ahora porque aborda la predicción del cambio de escena inducido por la interacción y la tokenización de acciones en un mismo espacio multimodal, algo poco habitual en los VLA publicados. No se han publicado en la información disponible datos sobre el dataset de entrenamiento, el contexto máximo ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en Qwen3-VL; componentes auxiliares VQ-VAE y RVQ |
| Parámetros totales | 4.447.303.168 (~4,45 B), según safetensors |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publican pesos safetensors; no se ofrecen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 9,7 GB |
| Descargas / likes | 370 / 11 |
| Fecha de creación | 11 de septiembre de 2026 |
| Última actualización | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura de transformer multimodal propia de la familia Qwen3-VL, sobre la que se añaden dos mecanismos específicos de robótica. El primero es la predicción de regiones dinámicas: se emplea flujo óptico para extraer las zonas de la escena que cambiarán en el futuro y un VQ-VAE para codificarlas en secuencias de longitud fija de tokens discretos. Condicionado por la imagen actual y por una descripción de tarea o una acción, el VLM predice directamente los *mask tokens* correspondientes a esas regiones dinámicas futuras, de modo que el modelo aprende a anticipar los cambios de escena inducidos por la interacción y no solo a describir el estado presente.

El segundo mecanismo es el aprendizaje de acciones discretas. El espacio de acción unificado se divide en tres componentes (poses del efector final, articulaciones del efector final y articulaciones del tren inferior) y se entrena un modelo RVQ independiente para cada uno, de forma que cada movimiento continuo se codifica en su propia secuencia de tokens. Las secuencias resultantes comparten los mismos pasos temporales y se inyectan de forma síncrona en el VLM. Las señales de entrenamiento declaradas por el autor son: tokens de imagen (entorno actual), tokens de lenguaje o de acción (condición de tarea), mask tokens (cambios futuros de escena), tokens discretos de poses del efector final, tokens de mano/gripper y tokens de articulaciones del tren inferior. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Comprensión visual y condicionamiento por lenguaje: procesa observaciones de imagen junto con descripciones de tarea para generar predicciones.
- Predicción de regiones dinámicas futuras: anticipa qué zonas de la escena cambiarán como consecuencia de una interacción, representadas como tokens discretos.
- Aprendizaje y representación de acciones robóticas discretas en tres componentes: poses del efector final, articulaciones del efector final y articulaciones del tren inferior.
- Alineación conjunta de representaciones visuales, lingüísticas y de acción dentro de un único VLM.
- Coordinación de cuerpo completo: la inclusión de articulaciones del tren inferior apunta a plataformas humanoides o con base móvil, además de brazos fijos.
- Manipulación diestra: los tokens de mano codifican movimiento de gripper o de mano articulada.
- Tareas demostradas por el autor en vídeo: limpieza de mesa, plegado de toallas, empaquetado de un teléfono y colocación de platos.
- No se declara soporte explícito de *tool calling*, function calling, agentes multi-paso, modo de razonamiento (*thinking*), audio ni otras modalidades adicionales.

## Casos de uso

- Manipulación de mesa y ordenación de objetos: el modelo predice las regiones que cambiarán al retirar o colocar objetos, lo que permite planificar la secuencia de agarres en tareas de *tidy-up* doméstico, tal como muestra la demostración de limpieza de mesa.
- Plegado de ropa y textiles deformables: la predicción de regiones dinámicas ayuda a anticipar cómo se deformará la tela durante el plegado, un escenario en el que las políticas puramente reactivas suelen fallar.
- Empaquetado y *pick-and-place* industrial: la demostración de empaquetado de un teléfono indica uso en celdas de montaje donde el efector final debe colocar piezas en posiciones precisas con realimentación visual.
- Manipulación en entornos de cocina o restauración: la tarea de colocación de platos sugiere aplicaciones de carga de lavavajillas o preparación de bandejas con objetos rígidos.
- Control de robots humanoides con locomoción: la tokenización separada del tren inferior permite integrar el modelo en plataformas bípedas que necesitan coordinar desplazamiento y manipulación.
- Investigación en modelos de mundo para robótica: sirve como banco de pruebas para estudiar si predecir regiones dinámicas mejora la generalización de políticas VLA frente a enfoques que solo modelan el estado actual.
- Aprendizaje por imitación a partir de demostraciones: los tokens de acción discretos pueden emplearse como espacio de salida para entrenamiento supervisado sobre trayectorias teleoperadas.
- Evaluación *offline* de políticas: al predecir acciones y cambios de escena dada una condición, puede usarse para estimar la plausibilidad de una trayectoria antes de ejecutarla en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni tasas de éxito en tareas de manipulación, y las demostraciones se presentan únicamente como vídeos cualitativos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 los 4,45 B de parámetros ocupan aproximadamente 8,9 GB solo en pesos, a los que hay que sumar activaciones, caché de atención y los módulos auxiliares (VQ-VAE y RVQ); en int8 se puede estimar en torno a 4,5 GB y en int4 en torno a 2,5-3 GB, aunque no se publican cuantizaciones oficiales.
- El tamaño del repositorio (9,7 GB) es superior al de los pesos teóricos en bf16, lo que apunta a componentes auxiliares adicionales o a pesos almacenados en mayor precisión.
- GPU recomendadas: A100 (40/80 GB), H100 y L40S para despliegue en servidor; RTX 4090 (24 GB) y RTX 6000 Ada (48 GB) para trabajo en estación de trabajo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 4080/4090 y tarjetas con 16-24 GB de VRAM en bf16, siempre que el framework de inferencia permita cargar todos los componentes.
- Opciones de despliegue: no se declara ninguna en la información disponible. Por la arquitectura Qwen3-VL sería razonable evaluar transformers y vLLM, pero no hay confirmación oficial. No se ofrecen pesos GGUF ni ONNX, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no disponible. Para control robótico en bucle cerrado hay que tener en cuenta que un VLM de 4,45 B más los decodificadores de acción difícilmente alcanzará frecuencias de control altas sin optimización específica, pero no se publican mediciones.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de información pública general y deben verificarse antes de usarlos como referencia; los del modelo analizado proceden del repositorio de HuggingFace.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| UnifoLM-ER-Flow | ~4,45 B (safetensors) | No disponible | Apache 2.0 | VLA con predicción de regiones dinámicas y acciones discretas por RVQ |
| OpenVLA | ~7 B | No disponible | Pesos bajo licencia Llama 2 (código MIT) | VLA sobre VLM Prismatic con acciones discretizadas |
| GR00T N1 (NVIDIA) | ~2,2 B | No disponible | Licencia de modelo abierto de NVIDIA (código Apache 2.0) | VLA humanoide con VLM Eagle-2 y cabecera de difusión |
| pi-zero (Physical Intelligence) | ~3 B | No disponible | Apache 2.0 | VLA con *flow matching* sobre PaliGemma |
| RDT-1B | ~1,2 B | No disponible | MIT | Modelo de difusión para manipulación bimanual |

No hay datos públicos comparables de rendimiento entre UnifoLM-ER-Flow y estas alternativas, ya que el primero no publica benchmarks.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay métricas cuantitativas de éxito en tareas, lo que impide comparar su rendimiento real con otras políticas VLA.
- Dataset no documentado: se desconoce el número de trayectorias, la composición de tareas y el reparto entre dominios, por lo que no se puede acotar el riesgo de sobreajuste a los escenarios de las demostraciones.
- Sesgos de dominio: las cuatro tareas mostradas (limpieza de mesa, plegado de toallas, empaquetado de teléfono y colocación de platos) son de manipulación doméstica o de laboratorio; se desconoce el comportamiento en entornos industriales, exteriores o con iluminación adversa.
- Riesgo de alucinación en la predicción de regiones dinámicas: un VLM que predice *mask tokens* puede generar cambios de escena plausibles pero incorrectos, y ese error se propagaría a la planificación de la acción.
- Dependencia de componentes auxiliares: la reconstrucción de acciones continuas depende de los decodificadores RVQ y del VQ-VAE, cuyas arquitecturas y pesos no se detallan en la información disponible ni se reflejan necesariamente en el recuento de 4,45 B parámetros.
- Idiomas no declarados: aunque la model card menciona condiciones de lenguaje y descripciones de tarea, no se especifica qué lenguas están soportadas ni con qué calidad.
- Contexto no declarado: sin longitud de contexto publicada no se puede garantizar el manejo de historiales largos de observaciones o instrucciones extensas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de la licencia del modelo base de la familia Qwen3-VL sobre el que se construye.
- Despliegue: no se publican cuantizaciones ni código de inferencia en los metadatos del repositorio, lo que añade trabajo de integración antes de llevarlo a producción.
- Control en tiempo real: sin datos de latencia publicados, no puede asegurarse que el modelo alcance la frecuencia necesaria para control robótico en bucle cerrado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/unitreerobotics/UnifoLM-ER-Flow
- Página del proyecto: https://unigen-x.github.io/unifolm-wla.github.io/
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos correspondían a tiendas de transportines para perros y no guardan relación con el modelo). No se han encontrado papers, blogs ni repositorios adicionales en la información disponible.
