# TimSchneider42/cod-vae-16x8-tiny

## Resumen

COD-VAE 16x8 tiny es un autoencoder variacional (VAE) para representar formas 3D como un conjunto compacto de vectores latentes. Desarrollado por TimSchneider42 como parte de una reimplementación no oficial en PyTorch/JAX del modelo COD-VAE original (Cho et al., ICCV 2025), este modelo comprime una malla 3D en 16 vectores latentes de 8 dimensiones (128 números en total) y los decodifica de vuelta a un campo de ocupación. Su diseño está orientado a pipelines donde el cuello de botella es la decodificación hacia delante y hacia atrás a través de un decodificador congelado, como en el aprendizaje por refuerzo con recompensa de reconstrucción.

Con aproximadamente 6,6 millones de parámetros, es la variante más pequeña de la familia 16x8, siendo unas 4 veces más rápida que la versión `-small` y unas 33 veces más rápida que el modelo completo en decodificación. A cambio, sacrifica calidad de reconstrucción: alcanza un IoU volumétrico de 0,7665 en el conjunto ABC, frente a 0,842 de la variante `-small`. Su licencia MIT permite uso comercial sin restricciones, y los pesos se distribuyen en formato npz autocontenido, cargables tanto con PyTorch como con JAX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) con decodificador basado en planos de consulta y atencion |
| Parametros totales | ~6,6 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa nubes de puntos y consultas 3D) |
| Tipos de cuantizacion | no disponible (pesos en float32/float16 segun backend) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | MIT |
| Formato de pesos | npz (autocontenido, cargable con PyTorch o JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura COD-VAE, que comprime una forma 3D en un conjunto de vectores latentes 1D (en este caso 16 vectores de 8 dimensiones). El codificador procesa la nube de puntos de superficie mediante bloques de atencion con parches, mientras que el decodificador refina la ocupacion en puntos de consulta arbitrarios usando planos de caracteristicas de baja resolucion (8 canales a 96x96) y una pila de capas de decodificacion latente. La configuracion concreta usa dimension de embedding 128, 4 cabezas de atencion, 2 bloques de codificador con 2 capas cada uno, 256 parches, y un decodificador de refinamiento con 4 capas y parches de 32 píxeles.

El entrenamiento sigue un esquema de dos etapas: una primera etapa de 200 epocas para el tronco compartido por fila (segun `num_latents`) y una segunda etapa de 100 epocas por celda con 6 capas de decodificador latente. El conjunto de datos combina 110.077 formas de multiples fuentes, el mismo que se uso para la familia `-small`. La configuracion fija `attention_implementation="default"` (ruta XLA), que resulta mas rapida que el kernel fusionado de cuDNN en secuencias cortas.

## Capacidades

- Reconstruccion de formas 3D: comprime una malla o nube de puntos en 16 vectores latentes de 8 dimensiones y los decodifica en un campo de ocupacion.
- Decodificacion en puntos de consulta arbitrarios: permite evaluar la ocupacion en coordenadas 3D especificas sin necesidad de voxelizar.
- Generacion de volumenes densos: puede producir una rejilla de logits de ocupacion a resolucion arbitraria (p. ej. 128^3) mediante `decode_volume`.
- Extraccion de caracteristicas latentes: los 128 numeros resultantes pueden usarse como representacion compacta para tareas posteriores (difusion 3D, aprendizaje por refuerzo, etc.).
- Compatibilidad con PyTorch y JAX: los pesos se cargan con cualquiera de los dos backends mediante la libreria `cod-vae`.
- Alta velocidad de decodificacion: 8,0 ms por paso en H100 con batch de 1024x2048 consultas, alcanzando 127k formas/s en forward+backward.

## Casos de uso

- Aprendizaje por refuerzo con recompensa de reconstruccion: el modelo esta disenado para pipelines donde se necesita decodificar latentes repetidamente (forward y backward) a traves de un decodificador congelado; su velocidad 4x superior a `-small` reduce drasticamente el coste por episodio.
- Generacion de formas 3D con modelos de difusion: los latentes de 128 dimensiones pueden servir como espacio intermedio para entrenar un modelo de difusion que genere nuevas formas, aprovechando la compacidad de la representacion.
- Compresion de mallas para almacenamiento o transmision: una malla compleja se reduce a 128 numeros, permitiendo almacenar catalogos de piezas CAD de forma muy eficiente.
- Reconstruccion a partir de nubes de puntos parciales: el codificador acepta nubes de puntos de superficie, por lo que puede usarse en pipelines de reconstruccion 3D a partir de escaneos LiDAR o fotogrametria.
- Evaluacion rapida de ocupacion en simulaciones fisicas: al poder consultar la ocupacion en puntos arbitrarios, es util para detectar colisiones o validar volumenes en tiempo real dentro de simuladores.
- Prototipado de modelos generativos 3D en entornos con recursos limitados: con solo 6,6M de parametros, cabe en GPUs de consumo y permite experimentar con generacion 3D sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

La model card reporta calidad de reconstruccion en el conjunto ABC (piezas CAD) con 128 formas fuera del entrenamiento:

| Metrica | cod-vae-16x8-tiny | cod-vae-16x8-small |
|---|---|---|
| Volumen IoU | 0,7665 | 0,842 |
| Precision cerca de la superficie | 0,7497 | 0,804 |

Velocidad de decodificacion medida en H100 con JAX float16, batch de 1024x2048 consultas, forward+backward a traves del latente completo:

| Modelo | Tiempo por paso | Throughput |
|---|---|---|
| cod-vae-16x8 (completo) | ~350 ms | 2,9k formas/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k formas/s |
| **cod-vae-16x8-tiny** | **8,0 ms** | **127k formas/s** |

No se han publicado resultados en benchmarks estandar de vision 3D como ShapeNet o ModelNet en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no publicada oficialmente, pero con ~6,6M de parametros en float16 ocupa aproximadamente 13 MB solo en pesos; el consumo real dependera del tamano del batch y de la resolucion de las consultas.
- GPU recomendadas: las mediciones de velocidad se realizaron en una NVIDIA H100, pero el modelo es lo bastante pequeno para ejecutarse en cualquier GPU moderna con al menos 4 GB de VRAM (p. ej. RTX 3050, RTX 4060).
- Compatibilidad con GPU de consumo: si, cabe sin problemas en GPUs de gama media e incluso en CPU para inferencia puntual, aunque la velocidad sera mucho menor.
- Opciones de despliegue: libreria `cod-vae` con backend PyTorch o JAX; no se menciona soporte para vLLM, llama.cpp u Ollama (no es un modelo de lenguaje).
- Latencia y throughput: 8,0 ms por paso y 127k formas/s en H100 con batch de 1024x2048 consultas (forward+backward); en GPU de consumo se espera un rendimiento proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Latente | Velocidad decodificacion (H100) | Volumen IoU (ABC) | Licencia |
|---|---|---|---|---|---|
| cod-vae-16x8-tiny | ~6,6M | 16x8 | 8,0 ms / 127k formas/s | 0,7665 | MIT |
| cod-vae-16x8-small | ~35M | 16x8 | 43,5 ms / 23,6k formas/s | 0,842 | MIT |
| cod-vae-16x8 (completo) | no disponible | 16x8 | ~350 ms / 2,9k formas/s | no disponible | MIT |

Los tres modelos comparten la misma forma latente (16x8), pero cada uno define su propio espacio latente: los latentes de uno no pueden decodificarse con otro. La variante tiny ofrece la mayor velocidad a costa de una calidad de reconstruccion notablemente inferior a la `-small`.

## Limitaciones y advertencias

- Calidad de reconstruccion reducida: con un IoU volumetrico de 0,7665 en ABC, esta por debajo del umbral de 0,75 que se fijo como minimo para la configuracion 16x8, pero muy lejos de los 0,842 de la variante `-small`; no es adecuado para aplicaciones que requieran alta fidelidad geometrica.
- Espacios latentes no intercambiables: aunque la forma del latente coincide con la de sus hermanos, cada modelo define su propio espacio; los latentes generados por uno no pueden decodificarse con otro.
- Sesgos del conjunto de datos: entrenado principalmente con piezas CAD (conjunto ABC), puede generalizar peor a formas organicas o escenas complejas.
- Riesgo de alucinacion geometrica: como todo VAE, puede generar ocupaciones irreales en regiones no cubiertas por los datos de entrada.
- Sin soporte para otros tipos de datos: no procesa texto, imagenes ni audio; es exclusivamente para formas 3D.
- Dependencia de la libreria `cod-vae`: requiere instalar el paquete desde GitHub; no hay una integracion directa con frameworks de despliegue estandar.
- Documentacion limitada: no se publican detalles sobre el dataset completo ni sobre el preprocesado exacto, lo que puede dificultar la reproducibilidad en otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TimSchneider42/cod-vae-16x8-tiny
- Repositorio GitHub de la libreria `cod-vae`: https://github.com/TimSchneider42/cod-vae
- Codigo fuente del paquete: https://github.com/TimSchneider42/cod-vae/tree/main/cod_vae
- Paper original de COD-VAE (Cho et al., ICCV 2025): https://arxiv.org/abs/2503.08737
- Guia de entrenamiento: https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- Modelo hermano `cod-vae-16x8`: https://huggingface.co/TimSchneider42/cod-vae-16x8
