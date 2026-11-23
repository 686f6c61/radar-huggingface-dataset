# xpanceo-team/mattergen-formula-e_above_hull

## Resumen

MatterGen es un modelo generativo de estructuras cristalinas desarrollado originalmente por Microsoft Research, y esta variante concreta (`xpanceo-team/mattergen-formula-e_above_hull`) es un ajuste fino publicado por el usuario xpanceo-team en Hugging Face. El modelo aborda el problema del diseno inverso de materiales: dada una serie de propiedades fisicoquimicas objetivo (en este caso, la energia por encima del casco convexo, `e_above_hull`, y la formula quimica), genera estructuras cristalinas tridimensionales plausibles que cumplen esas condiciones. Es relevante para flujos de descubrimiento de materiales asistido por IA, donde la generacion condicionada permite explorar el espacio de composiciones y estructuras sin recurrir a cribado exhaustivo.

Tecnicamente se distribuye como un pipeline de `diffusers` (`MatterGenPipeline`) con pesos en formato `safetensors`, un tamano de repositorio de aproximadamente 0,4 GB y un uso previsto de inferencia en GPU. La model card unicamente documenta un ejemplo de carga y generacion con PyTorch y `pymatgen`; no incluye informacion sobre arquitectura interna, datos de entrenamiento ni resultados de evaluacion.

La relevancia actual del modelo radica en su caracter condicionado por propiedades: a diferencia de generadores puramente incondicionales, permite fijar la composicion quimica y un umbral de estabilidad termodinamica, lo que lo hace adecuado para experimentos de generacion dirigida en dominios como baterias, catalisis o aleaciones. No obstante, la ausencia de documentacion tecnica detallada limita su uso en produccion sin una validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline de difusion `MatterGenPipeline` en `diffusers`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de generacion de estructuras cristalinas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga con `use_safetensors=False` segun la model card) |
| Tamano del repositorio | ~0,4 GB |
| Libreria | diffusers |
| Etiquetas | diffusers, safetensors, region:us |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Por el nombre del pipeline (`MatterGenPipeline`) y el ejemplo de uso, se trata de un modelo generativo de difusion aplicado a estructuras cristalinas, condicionado por propiedades fisicoquimicas (`e_above_hull`) y por la formula quimica de la composicion objetivo. La generacion se controla mediante un parametro de `guidance_scale` (en el ejemplo, 3.0) y un generador con semilla fija para reproducibilidad, lo que sugiere un esquema de difusion con guiado por clasificador o por condicionamiento.

No se han publicado en la informacion disponible datos sobre volumen de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas. El modelo es una variante ajustada del MatterGen original de Microsoft Research, pero no se documenta el proceso de ajuste ni los datos empleados.

## Capacidades

- Generacion condicionada de estructuras cristalinas tridimensionales a partir de una formula quimica y un valor objetivo de `e_above_hull`.
- Generacion por lotes (`batch_size`) con control de semilla para reproducibilidad.
- Parametro de guiado (`guidance_scale`) para modular la adherencia a la condicion.
- Integracion con `pymatgen` para manipular estructuras (`Structure`, `Lattice`).
- Ejecucion en GPU via PyTorch (`device="cuda"`).
- No se documentan capacidades de texto, codigo, vision, tool calling, agentes ni multilingues, ya que no es un modelo de lenguaje.

## Casos de uso

- Descubrimiento de materiales para baterias: fijar una formula concreta (por ejemplo, `Na3 Mn1 Co1 Ni1 O6`) y un umbral de estabilidad termodinamica para generar candidatos de catodo y filtrar los que caigan por debajo del casco convexo.
- Cribado de aleaciones: generar estructuras con una composicion objetivo y un `e_above_hull` bajo, para priorizar sintesis experimental en lugar de explorar todo el espacio de composiciones.
- Catalisis heterogenea: proponer estructuras superficiales o volumetricas de una formula dada y evaluar su estabilidad antes de calculos DFT adicionales.
- Generacion de candidatos para simulacion DFT: producir un lote de estructuras plausibles que sirvan como entrada a pipelines de calculo de energia y relajacion estructural.
- Aumento de datasets de materiales: generar estructuras condicionadas para ampliar conjuntos de entrenamiento de modelos predictivos de propiedades.
- Exploracion de polimorfos: con una misma formula y un objetivo de estabilidad, generar varias estructuras candidatas y analizar la diversidad estructural resultante.
- Docencia e investigacion metodologica: reproducir experimentos de generacion condicionada con semilla fija para estudiar el efecto del `guidance_scale` en la validez de las estructuras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (~0,4 GB) sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible. La model card usa `device="cuda"` sin especificar modelo de GPU.
- Cabe en GPU de consumo: probablemente si, dado el tamano de pesos, pero no confirmado en la informacion disponible.
- Opciones de despliegue: `diffusers` con `MatterGenPipeline` y PyTorch; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xpanceo-team/mattergen-formula-e_above_hull` | Difusion para estructuras cristalinas | no disponible | no aplica | no disponible | Hugging Face (10 descargas) |
| MatterGen (Microsoft Research) | Difusion para estructuras cristalinas | no disponible en esta ficha | no aplica | no disponible en esta ficha | Publicacion y repositorio de Microsoft Research |
| CDVAE | VAE para estructuras cristalinas | no disponible en esta ficha | no aplica | no disponible en esta ficha | Repositorio academico |
| DiffCSP | Difusion para estructuras cristalinas | no disponible en esta ficha | no aplica | no disponible en esta ficha | Repositorio academico |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta licencia, lo que impide determinar si el uso comercial esta permitido.
- No se especifican los datos de entrenamiento ni el proceso de ajuste, por lo que no es posible evaluar sesgos de composicion o de espacio quimico.
- Riesgo de generar estructuras fisicamente invalidas o termodinamicamente inestables; requiere validacion con DFT u otras herramientas.
- El condicionamiento por `e_above_hull` es un objetivo, no una garantia: el valor generado puede desviarse del solicitado.
- El parametro `use_safetensors=False` en el ejemplo de carga sugiere posibles problemas con la carga estandar de safetensors; conviene verificar el comportamiento en el entorno de destino.
- Modelo con muy baja adopcion (10 descargas, 0 likes) y sin evaluacion publica; no recomendado para produccion sin validacion exhaustiva.
- No es un modelo de lenguaje: no soporta texto, codigo, vision ni tool calling.
- El repositorio se actualizo por ultima vez en noviembre de 2026 segun los metadatos, lo que puede indicar cambios no documentados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/xpanceo-team/mattergen-formula-e_above_hull
- MatterGen (Microsoft Research): no disponible en la informacion proporcionada
- Repositorio de `crystal_diffusers`: no disponible en la informacion proporcionada
- Paper de MatterGen: no disponible en la informacion proporcionada
- Documentacion de `diffusers`: no disponible en la informacion proporcionada
