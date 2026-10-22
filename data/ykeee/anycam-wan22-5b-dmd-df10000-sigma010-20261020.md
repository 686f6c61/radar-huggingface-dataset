# ykeee/anycam-wan22-5b-dmd-df10000-sigma010-20261020

## Resumen

`ykeee/anycam-wan22-5b-dmd-df10000-sigma010-20261020` es un adaptador LoRA para el modelo de difusión de vídeo Wan2.2 en su variante de 5B, publicado por el usuario `ykeee` en HuggingFace. El repositorio está etiquetado con el pipeline `video-to-video` y la librería `wan2.2`, por lo que se trata de un ajuste fino orientado a transformar un vídeo de entrada en otro vídeo, no de un modelo base independiente. El tamaño del repositorio es de 39,4 GB, lo que sugiere que incluye pesos del modelo base además del adaptador, aunque la composición exacta no está documentada.

La nomenclatura del identificador (`dmd`, `df10000`, `sigma010` y la fecha `20261020`) apunta a un checkpoint intermedio de un proceso de entrenamiento, posiblemente con destilación por matching de distribuciones (DMD) y una configuración concreta de paso y sigma; el prefijo `anycam` sugiere control de cámara, pero ninguna de estas interpretaciones está confirmada en la información disponible. El modelo se publicó el 20 de octubre de 2026 y se actualizó dos días después, sin descargas ni valoraciones en el momento de redactar esta ficha.

Su relevancia actual es limitada pero potencialmente interesante para quien experimente con control de trayectoria de cámara en generación de vídeo sobre Wan2.2. El acceso es restringido (gated), la licencia no está declarada y solo se anuncia soporte de inglés, lo que condiciona cualquier evaluación seria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión de vídeo Wan2.2 5B; arquitectura del adaptador no disponible |
| Parametros totales | 5B en el modelo base (el adaptador LoRA añade una cantidad no especificada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana temporal de vídeo no documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según metadatos) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 39,4 GB; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Wan2.2 5B, un modelo de difusión para vídeo que emplea un VAE propio (Wan2.2-VAE) con una tasa de compresión de 16×16×4 y que, según la documentación oficial del proyecto, soporta generación texto-a-vídeo e imagen-a-vídeo a 720P y 24 fps. El repositorio que nos ocupa añade un LoRA sobre esa base para la tarea video-a-vídeo, de modo que el modelo base permanece congelado y el adaptador modifica el comportamiento de generación.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las innovaciones técnicas del adaptador. El sufijo `dmd` podría corresponder a destilación por matching de distribuciones y `df10000`/`sigma010` a hiperparámetros de entrenamiento, pero son inferencias a partir del nombre y no datos confirmados. Tampoco se documenta si el LoRA se entrenó con control explícito de cámara (el prefijo `anycam` así lo sugiere) ni qué tipo de señal de condicionamiento adicional requiere.

## Capacidades

- Transformación de vídeo a vídeo sobre el modelo base Wan2.2 5B, presumiblemente con edición o restilización del clip de entrada.
- Posible control de trayectoria de cámara, sugerido por el prefijo `anycam`, sin confirmación documental.
- Generación de vídeo a 720P y 24 fps heredada del modelo base Wan2.2 5B (según la documentación oficial de Wan2.2).
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de difusión de vídeo).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingües: solo inglés según los metadatos; no se documenta el comportamiento con prompts en otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Restilización de metraje existente: aplicar el LoRA sobre un clip grabado para modificar su estética o dominio visual manteniendo la estructura temporal, aprovechando que el pipeline es video-to-video.
- Previsualización de cambios de cámara en postproducción: si el prefijo `anycam` implica control de trayectoria, el adaptador podría emplearse para probar movimientos de cámara alternativos sobre un plano ya rodado antes de repetir el rodaje.
- Prototipado de efectos visuales: generar variantes de una secuencia para explorar direcciones artísticas en publicidad o videoclip, con revisión humana posterior.
- Investigación en adaptadores de vídeo: usar el checkpoint como punto de partida para estudiar el efecto de los hiperparámetros `dmd`, `df` y `sigma` en la calidad y estabilidad temporal del resultado.
- Pipeline de aumento de datos para visión por computador: transformar clips de un dataset para incrementar la diversidad de condiciones visuales, siempre que la licencia final lo permita.
- Pruebas de integración con la librería `wan2.2`: validar el adaptador dentro del ecosistema oficial de Wan2.2 antes de invertir en un ajuste propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas cuantitativas (FVD, LPIPS, CLIP-score ni evaluaciones de calidad temporal) y no se han encontrado comparaciones independientes del adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 39,4 GB, lo que sugiere pesos en fp16 del modelo base (~10 GB) más el adaptador y posibles artefactos de entrenamiento; una estimación razonable para inferencia a 720P se sitúa en el rango de 20-24 GB, aunque no está confirmada para este adaptador concreto.
- GPU recomendadas: la documentación oficial de Wan2.2 5B indica que el modelo base puede ejecutarse en una RTX 4090; para producción a 720P se recomendarían A100 o H100 por margen de memoria y throughput.
- ¿Cabe en GPU de consumo? Sí, según la documentación de Wan2.2 5B, que cita la RTX 4090 como hardware viable para el modelo base; el adaptador LoRA no debería aumentar significativamente el requisito, aunque no hay confirmación específica.
- Opciones de despliegue: librería `wan2.2` (paquete `wan22` en PyPI) y el repositorio oficial `Wan-Video/Wan2.2`. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ykeee/anycam-wan22-5b-dmd-df10000-sigma010-20261020` | 5B (base) + LoRA | 720P, 24 fps (heredado del base) | Video-to-video | no disponible | Gated en HuggingFace |
| Wan2.2 5B TI2V (modelo base oficial) | 5B | 720P, 24 fps | Texto-a-vídeo e imagen-a-vídeo | no disponible en la información consultada | Público en GitHub y PyPI |
| `ykeee/anycam-wan22-5b-tf-from10000-bs16-10k-20261012` | 5B (base) + LoRA | no disponible | Ajuste sobre Wan2.2 5B (tarea exacta no documentada) | no disponible | Gated en HuggingFace |
| `ostris/wan22_5b_i2v_crush_it_lora` | 5B (base) + LoRA | no disponible | Imagen-a-vídeo | no disponible | Público en ModelScope |

La comparación cuantitativa no es posible: ninguno de los repositorios consultados publica métricas comparables ni fichas técnicas detalladas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que impide su descarga automatizada en pipelines de CI.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de integrarlo en producción.
- Documentación inexistente: no hay model card con instrucciones, hiperparámetros recomendados ni ejemplos de uso, lo que eleva el coste de integración.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la ficha, sin evidencia externa de calidad o estabilidad.
- Idiomas: solo se anuncia inglés; los prompts en castellano podrían degradar el resultado.
- Riesgo de artefactos: como adaptador de difusión de vídeo, es esperable inestabilidad temporal y flickering, pero no hay datos publicados que lo cuantifiquen.
- Dependencia del modelo base: requiere descargar y cargar Wan2.2 5B, con el coste de almacenamiento y memoria asociado.
- Posible sobreajuste al dominio de entrenamiento: al desconocerse el dataset, no se puede garantizar generalización a otros tipos de vídeo.
- Riesgo de alucinación visual: la difusión puede generar contenido incoherente con el vídeo de entrada, especialmente en escenas con movimiento rápido u oclusiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ykeee/anycam-wan22-5b-dmd-df10000-sigma010-20261020
- Repositorio hermano del mismo autor: https://huggingface.co/ykeee/anycam-wan22-5b-tf-from10000-bs16-10k-20261012
- README del repositorio hermano: https://huggingface.co/ykeee/anycam-wan22-5b-tf-from10000-bs16-10k-20261012/blob/main/README.md
- Repositorio oficial de Wan2.2: https://github.com/Wan-Video/Wan2.2
- README oficial de Wan2.2: https://github.com/Wan-Video/Wan2.2/blob/main/README.md
- Paquete `wan22` en PyPI: https://pypi.org/project/wan22/
- LoRA comparable en ModelScope: https://www.modelscope.cn/models/ostris/wan22_5b_i2v_crush_it_lora/summary
