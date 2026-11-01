# TigerFan69/Krea-2-Maddison-v1

## Resumen

Krea 2 Maddison v1.0 es un adaptador LoRA de personaje para el modelo base Krea 2 Raw, desarrollado por TigerFan69. No es un modelo de lenguaje ni un modelo fundacional: es un ajuste fino ligero (adapter) que se aplica sobre un modelo de difusion texto-a-imagen para generar retratos y escenas de un personaje ficticio adulto original llamado Maddison. El paquete contiene unicamente los pesos del adaptador y no incluye imagenes de entrenamiento ni previsualizaciones generadas.

El adaptador se distribuye en formato safetensors con 512 tensores en precision fp16, ocupa aproximadamente 228,6 MB (0,2 GB de repositorio) y fue entrenado durante 1.000 pasos hasta la epoca 41. Se utiliza en flujos de trabajo compatibles con Krea 2 (por ejemplo, ComfyUI con un cargador LoRA de Krea 2) y requiere descargar por separado el modelo base y su text encoder y VAE bajo sus propios terminos.

Su relevancia es acotada: se trata de un artefacto de nicho para la comunidad de generacion de imagenes por personaje, publicado bajo la licencia comunitaria de Krea 2, que impone restricciones de uso comercial y de redistribucion. No dispone de benchmarks publicados ni de metricas de calidad verificadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter) sobre modelo de difusion texto-a-imagen Krea 2 Raw |
| Parametros totales | no disponible (adaptador de 512 tensores fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | no disponible; pesos en fp16 |
| Idiomas soportados | en |
| Licencia | krea-2-community-license (other) |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre Krea 2 Raw, un modelo de difusion texto-a-imagen. Los metadatos del archivo safetensors identifican el modelo base como Krea 2, con 1.000 pasos de entrenamiento y epoca 41, y el paquete contiene 512 tensores en fp16 con un total de 228.587.240 bytes. El SHA-256 verificado del archivo es `e4862550c5607ab8ba0b32ef9fea11907646f6919305c97418faeb3916cabfc2` y los bytes originales coincidian con el SHA-256 publicado en Civitai antes del empaquetado, sin alteracion de los pesos.

No se detalla en la informacion disponible la composicion del dataset de entrenamiento, el numero de imagenes utilizadas, la tecnica de regularizacion ni si se aplicaron etapas de refinamiento adicionales. El autor indica explicitamente que no se realizo una generacion nueva ni un benchmark de calidad para esta sincronizacion, y que no se reclama un rango de fuerza universalmente probado.

## Capacidades

- Generacion de imagenes texto-a-imagen de un personaje ficticio adulto original (Maddison) mediante el modelo base Krea 2 Raw.
- Retratos de personaje y escenas compatibles con flujos de trabajo Krea 2 (por ejemplo, ComfyUI con cargador LoRA de Krea 2).
- Control de identidad del personaje mediante el trigger `MaddisonV1`.
- Ajuste de fuerza del LoRA para explorar variaciones de identidad, anatomia, fondos y artefactos.
- Compatibilidad con prompts en ingles (unico idioma declarado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o video.

## Casos de uso

- Generacion de retratos de personaje consistentes: aplicar el LoRA con el trigger `MaddisonV1` sobre Krea 2 Raw para producir retratos de un mismo personaje ficticio en distintos encuadres y estilos, manteniendo coherencia de identidad entre generaciones.
- Ilustracion de escenas narrativas: usar el adaptador en flujos de ComfyUI para crear escenas de un personaje en contextos variados, comparando fuerzas del LoRA con prompts y semillas fijas para evaluar estabilidad de identidad.
- Prototipado visual para proyectos creativos: generar variantes rapidas de un personaje para maquetas, storyboards o pruebas de direccion de arte antes de producir arte final.
- Exploracion de fuerza e hiperparametros: probar distintos valores de fuerza del LoRA y prompts para identificar combinaciones que reduzcan artefactos anatomicos y de fondo, documentando los resultados con semillas fijas.
- Integracion en pipelines de generacion por lotes: incorporar el adaptador en un flujo Krea 2 automatizado (por ejemplo, scripts de ComfyUI) para producir conjuntos de imagenes de personaje bajo demanda.
- Evaluacion comparativa de adaptadores: usar el paquete como referencia junto con otros LoRA de personaje para comparar comportamiento de identidad y calidad sobre el mismo modelo base y los mismos prompts y semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizo una generacion nueva ni un benchmark de calidad para esta sincronizacion, y que no se reclama un rango de fuerza universalmente probado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Krea 2 Raw y del text encoder y VAE, que se descargan por separado.
- GPU recomendadas: no disponible; el adaptador en si ocupa unos 228,6 MB en fp16, pero el consumo real lo determina el modelo base.
- Compatibilidad con GPU de consumo: no disponible; depende de los requisitos del modelo base Krea 2 Raw.
- Opciones de despliegue: ComfyUI con un cargador LoRA compatible con Krea 2 (ruta `ComfyUI/models/loras/`). No se debe sustituir por un flujo de trabajo FLUX.1. Otras opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Maddison v1.0 (TigerFan69) | LoRA de personaje sobre Krea 2 Raw | Adaptador de 512 tensores fp16 (228,6 MB) | no aplica | krea-2-community-license | HuggingFace y Civitai |
| Krea 2 Raw (krea) | Modelo base texto-a-imagen | no disponible | no aplica | krea-2-community-license | HuggingFace |
| Otros LoRA de personaje para Krea 2 | Adaptadores de personaje | no disponible | no aplica | variable segun autor | no disponible |

No se dispone de datos de rendimiento comparativo entre este adaptador y otros LoRA de personaje, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Es un adaptador, no un modelo base: requiere descargar Krea 2 Raw y su text encoder y VAE por separado, bajo sus propios terminos.
- No debe usarse con flujos de trabajo FLUX.1; la compatibilidad esta limitada a flujos Krea 2.
- No se ha realizado una evaluacion de calidad ni de generacion nueva para esta sincronizacion; el autor no reclama un rango de fuerza probado universalmente.
- Riesgo de artefactos en identidad, anatomia, fondos y otros elementos visuales, especialmente fuera del rango de fuerza adecuado.
- Idioma unico declarado: ingles; los prompts en otros idiomas pueden degradar los resultados.
- Licencia krea-2-community-license: la descarga gratuita no implica uso comercial irrestricto ni permiso para vender modelos o fusiones. Es necesario leer LICENSE.pdf, NOTICE.txt y CREATOR-TERMS.md antes del uso.
- La licencia MIT del software LoRA Studio no se aplica a estos pesos.
- El personaje es ficticio y adulto; el autor pide no publicar fotos privadas, metadatos de flujo de trabajo ni credenciales en informes de soporte.
- No se incluyen imagenes de entrenamiento ni previsualizaciones generadas en el paquete.

## Enlaces

- HuggingFace: https://huggingface.co/TigerFan69/Krea-2-Maddison-v1
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Civitai (fuente): https://civitai.red/models/3025515?modelVersionId=3436049
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Repositorio LoRA Studio: https://github.com/TigerFan69/lora-studio
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Apoyo al autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
