# xiangxin0923/pi05_lora_tacimg_realworld_task820

## Resumen

Este repositorio contiene un checkpoint de ajuste fino (LoRA) del modelo de visión-lenguaje-acción (VLA) π0.5, desarrollado por el usuario xiangxin0923. Se trata del paso de entrenamiento 39999, preparado para ser servido mediante el script `server.sh` del proyecto T2-VLA. El modelo está diseñado para tareas de manipulación robótica en el mundo real, utilizando imágenes táctiles (tacimg) como entrada adicional, y ha sido entrenado sobre el dataset `realworld_task820`.

La relevancia de este checkpoint radica en que π0.5, el modelo base, es un VLA de código abierto desarrollado por Physical Intelligence que demuestra capacidades de generalización en entornos abiertos mediante co-entrenamiento con datos heterogéneos. Este LoRA específico adapta el modelo a una tarea concreta de manipulación real, lo que permite a investigadores y desarrolladores desplegar control robótico end-to-end sin necesidad de entrenar desde cero. El repositorio incluye los pesos en formato de checkpoint de OpenPI, con un tamaño de 9,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en π0.5 (PaliGemma + action expert) |
| Parametros totales | no disponible (el checkpoint es un LoRA, el modelo base π0.5 tiene 3.000 millones de parametros aproximados) |
| Parametros activos | no disponible (al ser LoRA, solo se actualizan los adaptadores) |
| Longitud de contexto | no disponible (hereda la del modelo base, tipicamente 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en formato original de OpenPI, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero este checkpoint no especifica) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint de OpenPI (safetensors probablemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo base π0.5 es un VLA que combina un codificador de vision-lenguaje (basado en PaliGemma) con un "action expert" que genera acciones de control continuo. Se entrena mediante co-entrenamiento con datos heterogeneos de multiples plataformas roboticas, lo que mejora la generalizacion en entornos abiertos. El checkpoint aqui presentado es un LoRA (Low-Rank Adaptation) que ajusta el modelo base para una tarea especifica de manipulacion real, utilizando imagenes tactiles como entrada adicional. El dataset de entrenamiento es `realworld_task820`, aunque no se proporcionan detalles sobre su composicion o numero de episodios. El entrenamiento alcanzo el paso 39999, lo que sugiere un ajuste prolongado, pero no se especifican hiperparametros ni tecnicas de alineacion adicionales (RLHF, DPO, etc.).

## Capacidades

- Control robotico end-to-end: genera acciones de manipulacion directamente a partir de observaciones visuales y de lenguaje.
- Integracion de imagenes tactiles: el sufijo "tacimg" indica que el modelo acepta imagenes de sensores tactiles como entrada, ademas de las camaras RGB.
- Ejecucion de tareas del mundo real: entrenado sobre el dataset `realworld_task820`, orientado a escenarios fisicos reales.
- Generalizacion a entornos abiertos: hereda las capacidades de π0.5 de manejar escenarios no vistos durante el entrenamiento.
- Soporte de instrucciones en lenguaje natural: al basarse en PaliGemma, puede interpretar comandos textuales para guiar la manipulacion.
- Despliegue mediante OpenPI: compatible con el ecosistema de servidores y herramientas de Physical Intelligence.

## Casos de uso

- Manipulacion robotica en laboratorio: investigadores pueden desplegar este checkpoint en un brazo robotico para reproducir la tarea 820 del dataset real, evaluando la precision del control tactil.
- Investigacion en aprendizaje por imitacion: el LoRA sirve como punto de partida para estudiar como el ajuste fino con datos tactiles mejora el rendimiento en tareas de contacto fisico.
- Desarrollo de sistemas de robotica asistiva: el modelo puede adaptarse para tareas de asistencia en entornos domesticos, como recoger objetos o abrir puertas, gracias a su capacidad de generalizacion.
- Benchmarking de VLA en hardware real: permite comparar el rendimiento de π0.5 con otros VLA en una tarea concreta, usando el mismo protocolo de servidor.
- Transferencia a nuevas tareas: al ser un LoRA, se puede combinar con otros adaptadores para explorar la composicion de habilidades.
- Educacion en robotica: sirve como ejemplo practico de como ajustar y servir un VLA de ultima generacion en un entorno academico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este checkpoint en la informacion disponible. El paper de π0.5 reporta mejoras sobre π0 en tareas de manipulacion en entornos abiertos, pero no se puede atribuir esos resultados a este LoRA concreto sin datos adicionales.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un LoRA de un modelo de 3B parametros, se estima que la inferencia requiere al menos 8-12 GB de VRAM en precision FP16, dependiendo de la resolucion de imagen y el tamaño de lote.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para ejecutar el modelo base y el adaptador sin problemas de memoria.
- Compatibilidad con GPU de consumo: posible en GPUs de gama alta (RTX 3090/4090) si se reduce la resolucion de entrada o se usa cuantizacion, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: el repositorio indica usar el script `server.sh` del proyecto T2-VLA, que probablemente utiliza el servidor de OpenPI. Tambien podria integrarse con vLLM o TGI si se convierte a un formato compatible, pero no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 (base) | 3B | 4096 | VLA generalista | no disponible | Codigo abierto en OpenPI |
| Este LoRA (pi05_lora_tacimg) | LoRA sobre 3B | no disponible | VLA para tarea tactil especifica | no disponible | HuggingFace |
| OpenVLA | 7B | 2048 | VLA generalista | MIT | Codigo abierto |
| RT-2 | 55B | 2048 | VLA generalista | no disponible | No abierto |

La comparativa se basa en el modelo base π0.5, ya que el checkpoint es un adaptador. OpenVLA es una alternativa de tamano similar con licencia permisiva, mientras que RT-2 es mas grande pero no accesible. No se dispone de datos de rendimiento comparativo para este LoRA especifico.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un modelo entrenado con datos de robotica, puede tener limitaciones en la diversidad de entornos y objetos.
- Riesgo de alucinacion: en tareas de manipulacion, el modelo puede generar acciones incorrectas si la observacion es ambigua o fuera de distribucion.
- Limitaciones de contexto: la ventana de contexto heredada de π0.5 (probablemente 4096 tokens) puede limitar instrucciones muy largas o historiales extensos.
- Restricciones de licencia: la licencia no esta especificada, por lo que el uso comercial es incierto. Se recomienda contactar al autor.
- Caveat de produccion: el checkpoint es un LoRA especifico para una tarea concreta; no se garantiza su funcionamiento en otras tareas sin reentrenamiento.
- Dependencia del dataset: el rendimiento depende de la calidad y cobertura del dataset `realworld_task820`, que no esta documentado en detalle.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xiangxin0923/pi05_lora_tacimg_realworld_task820
- Paper de π0.5: https://arxiv.org/abs/2504.16054
- Version HTML del paper: https://arxiv.org/html/2504.16054v1
- Sitio de OpenPI: https://www.openpi.net/english.html
- Repositorio relacionado (variante replayed): https://huggingface.co/xiangxin0923/pi05_lora_tacimg_realworld_replayed_tabero_820
- Repositorio relacionado (variante real_820): https://huggingface.co/xiangxin0923/pi05_lora_tacimg_real_820
