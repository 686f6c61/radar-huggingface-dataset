# TimSchneider42/cod-vae-32x8-tiny

## Resumen

cod-vae-32x8-tiny es un autoencoder variacional (VAE) para geometría 3D desarrollado por TimSchneider42. Comprime una forma 3D en 32 vectores latentes de 8 dimensiones (256 números) y los decodifica de vuelta a un campo de ocupación. Comparte la forma latente con cod-vae-32x8, pero está pensado para pipelines en los que el tiempo de reloj lo marca el forward+backward de decodificación a través de un decoder congelado, por ejemplo en RL con recompensa de reconstrucción.

Con unos 6,6 millones de parámetros, es aproximadamente 4 veces más rápido que la variante -small y 33 veces más rápido que el modelo de tamaño completo. Está entrenado con cod-vae, una reimplementación en PyTorch/JAX de COD-VAE (Cho et al., ICCV 2025). No es un modelo de lenguaje: no tiene ventana de contexto, no procesa texto y no soporta tool calling ni agentes.

Su relevancia actual está en la generación y reconstrucción 3D: sirve como extractor de características, como decoder rápido para evaluar formas y como componente de modelos de difusión 3D que operan sobre latentes compactos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | COD-VAE; autoencoder 3D decode-first con encoder, decoder de refinamiento y decoder latente; atención con implementación XLA por defecto |
| Parámetros totales | ~6,6 M |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; latente fijo de 32 vectores × 8 dimensiones = 256 números |
| Tipos de cuantización | no disponible; en la evaluación se usan pesos cargados desde npz y JAX float16 |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | npz autocontenido (compatible con backends PyTorch y JAX) |
| Tarea | feature-extraction / reconstrucción de formas 3D |
| Librería | cod-vae |

## Arquitectura y entrenamiento

La arquitectura sigue la receta COD-VAE. Frente a la variante -small, reduce dimensiones: embed dim 128 y 4 cabezas; encoder de 2 bloques × 2 capas, 256 patches y mlp 2; decoder de refinamiento de 4 capas con patches de 32 px; planos de consulta (query_dim) de 8 canales a 96²; y decoder latente de 6 capas. El total son ~6,6 M de parámetros. La configuración fija `attention_implementation="default"` (ruta XLA), que en estas secuencias cortas es mediblemente más rápida que el kernel fusionado de cuDNN.

Se entrenó con el mismo dataset fusionado de 110.077 formas y la misma receta en dos etapas que la familia -small: una etapa 1 de 200 épocas para el tronco por `num_latents` (compartida por su fila) y una etapa 2 nueva de 100 épocas por celda con 6 capas de decoder latente. No se indica uso de RLHF ni DPO, que no aplican a este tipo de modelo. Los pesos se distribuyen como npz autocontenido.

## Capacidades

- Codificar una malla 3D a un latente de forma (32, 8) mediante `encode_mesh`, devolviendo también la transformación.
- Decodificar un latente a una malla `trimesh.Trimesh` mediante `decode_mesh`.
- Codificar nubes de puntos de superficie crudas en [-1, 1]^3 mediante `encode`.
- Decodificar logits de ocupación en puntos de consulta arbitrarios mediante `decode` (positivos en el interior).
- Generar una rejilla densa de logits de ocupación con `decode_volume` a una resolución configurable (por ejemplo, 128).
- Extracción de características latentes para modelos generativos 3D o para aprendizaje posterior.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni visión/audio/texto.

## Casos de uso

- Reconstrucción de CAD y piezas industriales: a partir de mallas o nubes de puntos, obtener latentes compactos y reconstruir geometría; útil para visores, reparación de mallas y comparación de piezas. Validado en ABC CAD parts con 0,8006 de volume IoU.
- Extracción de características para difusión 3D: el latente de 256 números puede alimentar modelos de difusión que generan formas 3D, como en el trabajo COD-VAE original.
- Recompensa de reconstrucción en RL: gracias a su decode rápido (8,0 ms por paso en H100 para la variante 16x8 tiny), se puede usar un decoder congelado para calcular recompensas de reconstrucción en bucles de RL sin que el coste de decodificación domine.
- Preprocesado en escaneo 3D e impresión 3D: convertir escaneos a campo de ocupación y reconstruir mallas watertight para slicers o simulaciones.
- Comprobación de colisiones y planificación robótica: `decode_volume` permite evaluar ocupación en rejillas densas; el modelo es pequeño y rápido, adecuado para comprobar si una configuración de robot colisiona con una forma.
- Generación de datos sintéticos y aumento de datos: muestrear latentes y decodificarlos para producir formas 3D adicionales para entrenar otros modelos.
- Prototipado en investigación con PyTorch o JAX: al ser un npz autocontenido y compatible con ambos backends, permite integrar el encoder/decoder en experimentos sin dependencias pesadas.
- Evaluación de calidad de mallas: usar el error de reconstrucción o el IoU de volumen como métrica para comparar pipelines de adquisición o simplificación de mallas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (no aplica). Los datos disponibles son de reconstrucción y velocidad de decodificación.

| Modelo | Fuente | Formas held-out | Volume IoU | Near-surface accuracy |
|---|---|---|---|---|
| cod-vae-32x8-tiny | ABC (CAD parts) | 128 | 0,8006 | 0,7694 |
| cod-vae-32x8 (full) | ABC (CAD parts) | 128 | 0,900 | 0,858 |

| Modelo | Paso | Throughput |
|---|---|---|
| cod-vae-16x8 (full) | ~350 ms | 2,9k shapes/s |
| cod-vae-16x8-small | 43,5 ms | 23,6k shapes/s |
| cod-vae-16x8-tiny | 8,0 ms | 127k shapes/s |

Medido en H100, JAX float16, batch 1024 × 2048 queries, forward+backward a través del latente completo. Las cifras de la familia tiny se midieron en la variante 16x8; el autor indica que `num_latents` y `latent_dim` apenas mueven el coste de decodificación, por lo que son representativas de toda la familia tiny. No hay medición específica publicada para cod-vae-32x8-tiny. El grid -small llega hasta 16x16, así que esta forma latente 32x8 no tiene hermano -small.

## Requisitos de hardware

- Parámetros: ~6,6 M. Pesos en float16 ≈ 13 MB; en float32 ≈ 26 MB.
- VRAM: no disponible una cifra oficial. Depende del batch y del número de queries; con batch 1024 × 2048 queries las activaciones pueden ser el componente dominante.
- GPU recomendadas: H100 para las cifras publicadas. Por tamaño, el modelo debería caber en GPUs de consumo, pero no hay validación oficial publicada en RTX 4090, RTX 3090 u otras.
- Consumer GPU: no confirmado oficialmente; el tamaño de pesos es muy reducido, aunque el pipeline de consulta densa puede requerir más memoria.
- Despliegue: librería cod-vae con backends PyTorch o JAX, carga desde HuggingFace Hub con `CODVAE.from_pretrained`. Instalación: `pip install "cod-vae[torch,hub]"` o `pip install "cod-vae[jax,hub]"`. No aplican vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia/throughput: 8,0 ms y 127k shapes/s en H100 para la variante 16x8 tiny en el protocolo indicado; el autor señala que estos números son válidos para toda la familia tiny.
- Formato de pesos: npz autocontenido, sin necesidad de conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Latente | Volume IoU (ABC) | Throughput decodificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cod-vae-32x8-tiny | ~6,6 M | 32 × 8 | 0,8006 | familia tiny: 127k shapes/s (16x8) | MIT | HuggingFace |
| cod-vae-32x8 (full) | no disponible | 32 × 8 | 0,900 | no disponible para 32x8 | MIT (no confirmado en la model card) | HuggingFace |
| cod-vae-16x8-small | ~35 M | 16 × 8 | no disponible para 32x8; el grid -small llega hasta 16x16 | 23,6k shapes/s | MIT (no confirmado en la model card) | HuggingFace |
| cod-vae-16x8-tiny | no disponible | 16 × 8 | no disponible | 127k shapes/s | MIT (no confirmado en la model card) | HuggingFace |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no tiene contexto, no soporta tool calling, agentes, multilingüismo ni razonamiento simbólico.
- El espacio latente es específico de cada modelo: los latentes de este modelo no se pueden decodificar con cod-vae-32x8 ni con sus hermanos, aunque compartan forma.
- Calidad inferior al modelo completo: 0,8006 de volume IoU frente a 0,900 en el mismo protocolo ABC.
- Validación limitada: solo se publican resultados en ABC (CAD parts) con 128 formas held-out; no hay datos en escaneos ruidosos, escenas completas, geometrías no manifold o dominios fuera de distribución.
- Riesgo de reconstrucciones incorrectas en formas fuera de distribución; no es un generador de texto y no aplica el concepto de alucinación lingüística, pero puede producir geometría plausible pero incorrecta.
- No se documentan sesgos demográficos ni de otro tipo; al ser un modelo geométrico, los sesgos relevantes serían de dominio (por ejemplo, sobrerrepresentación de CAD frente a escaneos).
- Licencia MIT: permite uso comercial y modificación, pero requiere conservar el aviso de copyright y la licencia. No se indican restricciones adicionales.
- No hay garantías de producción: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha; el modelo es nuevo y sin validación comunitaria.
- El pipeline de consulta densa (`decode_volume`) puede consumir memoria proporcional a la resolución al cubo; hay que dimensionar la resolución.
- Dependencia de la librería cod-vae; no hay exportación oficial a ONNX, GGUF ni TensorRT.

## Enlaces

- https://huggingface.co/TimSchneider42/cod-vae-32x8-tiny
- https://arxiv.org/abs/2503.08737
- https://github.com/TimSchneider42/cod-vae
- https://github.com/TimSchneider42/cod-vae/blob/main/TRAINING.md
- https://huggingface.co/TimSchneider42/cod-vae-32x8
- https://huggingface.co/TimSchneider42/cod-vae-16x8-small
