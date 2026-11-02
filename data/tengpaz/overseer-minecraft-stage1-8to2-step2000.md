# Tengpaz/overseer-minecraft-stage1-8to2-step2000

## Resumen

`overseer-minecraft-stage1-8to2-step2000` es un checkpoint de un modelo generativo de síntesis de vistas novedosas (*novel-view synthesis*, NVS) especializado en entornos de Minecraft, desarrollado por el usuario Tengpaz. El modelo resuelve la tarea de reconstruir dos vistas de agente (Alpha y Bravo) a partir de ocho vistas de entrada: seis auxiliares con campo de visión de aproximadamente 129 grados y dos vistas de agente con unos 70 grados. Utiliza un enfoque de *flow matching* sobre un espacio latente 3D, apoyado en un códec GAE y en el modelo DA3 para la parte congelada del pipeline.

La particularidad de este checkpoint es que las dos vistas objetivo también están presentes en el conjunto de entrada en la misma marca temporal. Por tanto, el modelo ve la respuesta en su condicionamiento y solo debe aprender a eliminar ruido, lo que lo convierte en una línea base de cota superior deliberada y en un peldaño hacia la predicción temporal real. No es comparable con configuraciones donde el objetivo no está observado.

El checkpoint corresponde al paso 2000, el primero del entrenamiento de la etapa 2. Según la model card, la mayor parte de la ganancia ya se captura aquí: la PSNR sube de 16,5 en el paso 500 a 30,31 en el paso 2000, y luego se estabiliza en torno a 30,80 hacia el paso 20000. El repositorio ocupa 13,5 GB e incluye el estado completo de entrenamiento, no solo los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching sobre espacio latente 3D, con pila congelada DA3 + códec GAE |
| Parametros totales | no disponible (los pesos del modelo ocupan 3,7 GB en el fichero de estado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no de texto) |
| Licencia | other |
| Formato de pesos | `.pt` (checkpoint de PyTorch con estado completo: modelo, EMA, optimizador, scheduler, RNG) |

## Arquitectura y entrenamiento

El modelo se basa en *flow matching* aplicado sobre un espacio latente 3D. La pila de la etapa 1 (DA3 y el códec GAE) permanece congelada y sin cambios; la etapa 2 entrena únicamente el módulo de flow. La inicialización parte de los pesos EMA de `overseer-minecraft-stage1-6to2-step18000`, de modo que el modelo arranca con conocimiento del estilo de renderizado de Minecraft y del rig de cámaras auxiliar y de agente.

El contrato de tarea es `gae-independent-nvs-v1`, con 8 vistas de origen (6 auxiliares de ~129 grados de FOV y 2 de agente de ~70 grados), 2 objetivos (Alpha y Bravo, ambos observados), resolución de imagen de 378x672 y 4 fotogramas por episodio. El entrenamiento usó 38.580 episodios de entrenamiento y 200 de validación, sobre 8 GPUs, con `lr=1e-5`, `min_lr=1e-6`, `weight_decay=0.0` y `warmup_steps=500`. El checkpoint incluye el estado completo para permitir reanudar el entrenamiento de forma bit-exacta; la reanudación exige la misma revisión de código, ya que el contrato compara el sha256 de cada fichero `.py` bajo `easylab/`.

## Capacidades

- Síntesis de vistas novedosas en entornos de Minecraft a partir de 8 vistas de entrada.
- Generación de 2 vistas de agente (Alpha y Bravo) con resolución de 378x672.
- Reconstrucción de vistas observadas en el condicionamiento (tarea de cota superior, no predicción temporal pura).
- Modelado de estilo de renderizado de Minecraft y del rig de cámaras auxiliar y de agente, heredado de la etapa 1.
- Inferencia mediante muestreo con 16 pasos de denoising.
- No se documentan capacidades de tool calling, agentes, texto, audio ni razonamiento multilingüe.

## Casos de uso

- Investigación en síntesis de vistas novedosas: sirve como línea base de cota superior para medir cuánto margen queda en configuraciones donde el objetivo no está observado, comparando directamente con el ajuste 6->2.
- Desarrollo de *world models* para entornos de videojuego: el modelo aprende la geometría y el estilo visual de Minecraft, útil para prototipar sistemas de predicción de vistas en motores de mundo.
- Reconstrucción de vistas de agente en pipelines de captura: dado un rig de 6 cámaras auxiliares y 2 de agente, permite regenerar las vistas de agente a 378x672 con una PSNR de referencia de 30,31.
- Punto de partida para *fine-tuning*: al incluir el estado completo (optimizador, scheduler, RNG), se puede reanudar o adaptar el entrenamiento a nuevas tareas de predicción temporal sin partir de cero.
- Evaluación de códecs latentes: al apoyarse en el códec GAE congelado, sirve para estudiar la calidad de reconstrucción atribuible al espacio latente frente al módulo de flow.
- Docencia y reproducción de experimentos: el contrato de tarea explícito y el estado completo facilitan reproducir el entrenamiento de forma determinista en un entorno de 8 GPUs.

## Benchmarks y rendimiento

Métricas de validación en el paso 2000, medidas sobre una lista congelada de 200 pares `(episodio, fotograma)` retenidos (400 vistas objetivo) con 16 pasos de muestreo:

| Metrica | Global | Alpha | Bravo |
|---|---|---|---|
| PSNR | 30,307 | 30,308 | 30,307 |
| SSIM | 0,9047 | 0,9040 | 0,9055 |

Evolución de la PSNR durante el entrenamiento: 16,5 en el paso 500, 30,31 en el paso 2000 y aproximadamente 30,80 en el paso 20000 (meseta). No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos EMA ocupan 3,1 GB y los pesos del modelo 3,7 GB, por lo que la inferencia requiere al menos esos pesos más activaciones y el códec congelado.
- GPU recomendadas: no disponible; el entrenamiento se realizó en 8 GPUs.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos (3-4 GB) es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos publicados.
- Opciones de despliegue: carga directa del checkpoint `.pt` en PyTorch (se recomienda `mmap=True`); extracción de pesos EMA con `extract_flow_init.py` para usarlos como `system.params.flow_checkpoint`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| overseer-minecraft-stage1-8to2-step2000 | no disponible | no disponible | NVS Minecraft 8->2 (objetivos observados) | other | HuggingFace |
| overseer-minecraft-stage1-6to2-step18000 | no disponible | no disponible | NVS Minecraft 6->2 (etapa 1) | other | HuggingFace |
| Otros modelos de NVS / world models | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con `overseer-minecraft-stage1-6to2-step18000`, del que este checkpoint se inicializa: el ajuste 8->2 con objetivos observados no es comparable con el 6->2 con objetivos no observados, tal como advierte la propia model card.

## Limitaciones y advertencias

- Las vistas objetivo están observadas en el condicionamiento, por lo que el modelo no realiza predicción temporal real; es una cota superior y no debe compararse con configuraciones de objetivo no observado.
- Licencia `other`: no se especifican los términos exactos de uso comercial; es necesario consultar al autor antes de cualquier uso en producción.
- No hay información sobre sesgos, riesgo de alucinación visual ni limitaciones de idioma (es un modelo de visión, no de texto).
- El checkpoint es un estado completo de entrenamiento de 13 GB; cargarlo directamente requiere más memoria que usar solo los pesos EMA extraídos.
- La reanudación del entrenamiento exige la revisión de código exacta (comparación sha256 de los `.py` bajo `easylab/`), lo que limita la portabilidad del estado.
- Solo se ha validado en Minecraft y a resolución 378x672 con 4 fotogramas por episodio; la generalización a otros dominios o resoluciones no está documentada.
- No se han publicado latencias, throughput ni requisitos de VRAM para inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tengpaz/overseer-minecraft-stage1-8to2-step2000
- Checkpoint de inicialización (etapa 1, 6->2): https://huggingface.co/Tengpaz/overseer-minecraft-stage1-6to2-step18000
- Repositorio de código: rama `wyz/3dlatent-minecraft-nvs` del repositorio `tri-world-model`, bajo `projects/minecraft_nvs/` (no se proporciona URL directa en la información disponible).
