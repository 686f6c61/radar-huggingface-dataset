# zengzzy/PatchLocks

## Resumen

PatchLocks es un modelo de difusión para reconstruir pelaje animal como mechones (strands) individuales de geometría 3D a partir de imágenes multivista, empleando un único prior de parche aprendido. Lo publica el usuario zengzzy en HuggingFace, y el repositorio contiene exclusivamente los pesos del modelo; el código, la documentación y la guía de uso están en el repositorio de GitHub github.com/CCdydy/PatchLocks.

El modelo resuelve el problema de convertir observaciones 2D (varias vistas de un animal) en representaciones de pelo explícitas como mechones, un paso necesario para renderizado realista, generación de assets y simulación capilar. La arquitectura combina un codec de mechones (z64 ↔ strand) heredado de DiffLocks, un modelo de difusión EDM sobre latentes de mechón de 64 canales y un backbone de condicionamiento DINOv2 cargado vía torch.hub.

Es relevante ahora porque aborda la reconstrucción de pelaje a nivel de mechón sin depender de escaneos 3D volumétricos, reutilizando priors aprendidos sobre parches sintéticos y modelos de visión preentrenados. El entrenamiento es ligero (1.600 parches sintéticos × 4 vistas, ~30 minutos en una NVIDIA RTX PRO 6000), lo que reduce la barrera de reproducción respecto a pipelines anteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión EDM sobre latentes de mechón de 64 canales; codec de mechones (z64 ↔ strand) de DiffLocks; backbone de condicionamiento DINOv2 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de difusión para geometría 3D, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato .pt / PyTorch, sin variantes GGUF u otras cuantizaciones publicadas) |
| Idiomas soportados | no disponible (entrada en imágenes multivista; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt); el mayor checkpoint pesa 148 MB, el resto entre 6,5 MB y 157 MB |

## Arquitectura y entrenamiento

PatchLocks se apoya en una difusión tipo EDM que opera sobre latentes de mechón de 64 canales, con un esquema de ponderación por canal de grupo (clump-channel weighting) que constituye la receta principal del artículo. Un fusedor multivista (b3_fuser) combina las observaciones de las distintas vistas, y el backbone de condicionamiento es DINOv2, cargado a través de torch.hub. La representación de mechones se decodifica con un codec (z64 ↔ strand) tomado de DiffLocks y ajustado finamente para este proyecto.

El entrenamiento principal usó 1.600 parches de pelaje sintéticos cubriendo nueve arquetipos de pelaje, con cuatro vistas por parche, semilla 0, y aproximadamente 30 minutos en una única NVIDIA RTX PRO 6000 mediante el script `pipeline/02_train_diffusion.sh`. El repositorio incluye además checkpoints de variantes: un baseline monovista (Table 1, "1-view"), una ablación de receta sin ponderación por canal de grupo, un baseline de latente determinista (Table 2) y un baseline de regresión escalar (Table 2). Según el autor, reejecutar el checkpoint liberado reproduce las predicciones de difusión del artículo bit a bit y todas las tablas del paper, con detalles de reproducibilidad en `docs/REPRODUCIBILITY.md`.

## Capacidades

- Reconstruccion de pelaje animal como mechones (strands) individuales de 3D a partir de imagenes multivista.
- Generacion de geometria capilar explicita a traves de un codec latente (z64 ↔ strand) heredado de DiffLocks.
- Condicionamiento sobre multiples vistas mediante el fusedor multivista (b3_fuser).
- Variante de baseline monovista (a partir de un solo punto de vista).
- Variantes de ablacion para experimentacion: latente determinista y regresion escalar.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no aplicable (la entrada es visual, no textual).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla del condicionamiento por imagenes para la tarea especifica de reconstruccion de pelaje.

## Casos de uso

- Produccion de assets 3D para animacion y videojuegos: a partir de fotografias multivista de un animal se generan mechones de pelaje listos para grooming y renderizado en un DCC, evitando modelado manual de pelo.
- Renderizado realista de criaturas en VFX: reconstruir el pelaje como geometria de mechones permite integrar animales digitales con apariencia coherente bajo distintas condiciones de iluminacion.
- Digital twins de animales para investigacion biologica o veterinaria: generar representaciones de pelaje medibles de forma no invasiva desde fotografias.
- Dataset sintetico y aumento de datos: usar las variantes baseline y de ablacion para generar pares imagen-pelaje y alimentar otros modelos de vision o de reconstruccion.
- Investigacion en reconstruccion de cabello y pelo: emplear el codec y los checkpoints como punto de partida reproducible para comparar metodos de difusion frente a baselines deterministas.
- Reproduccion cientifica: reevaluar las tablas del paper con los checkpoints liberados para verificar predicciones bit a bit.
- Herramientas de autor para artistas tecnicos: integrar el pipeline en scripts de grooming para acelerar la fase inicial de generacion de mechones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor referencia tablas comparativas (Table 1 "ours" frente a "1-view", y Table 2 para los baselines de latente determinista y regresion escalar) y una tabla de ablacion de receta, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Como referencia, el mayor checkpoint (modelo de difusion principal) ocupa 148 MB y el conjunto de pesos del repositorio suma aproximadamente 0,6 GB, lo que sugiere requisitos moderados, pero no se especifica la VRAM necesaria.
- GPU de entrenamiento documentada: una sola NVIDIA RTX PRO 6000 para el entrenamiento principal (~30 minutos).
- GPU recomendadas: no disponible en la documentacion proporcionada. Por el peso de los checkpoints, es probable que quepa en GPUs de consumo, pero este dato no esta confirmado.
- Opciones de despliegue: no se indica soporte para vLLM, llama.cpp, Ollama o TGI (no son aplicables, ya que es un modelo de difusion en PyTorch). El despliegue previsto es mediante PyTorch siguiendo el codigo del repositorio, con descarga de pesos via `scripts/download_weights.sh` o la CLI de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Ambito | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PatchLocks | Reconstruccion de pelaje multivista | no disponible | no aplicable | no disponible | Pesos en HuggingFace (zengzzy/PatchLocks) |
| DiffLocks | Reconstruccion de pelo (origen del codec) | no disponible | no aplicable | no disponible | Proyecto en difflocks.is.tue.mpg.de |
| Otros metodos de reconstruccion de pelo/pelaje | Reconstruccion capilar | no disponible | no aplicable | no disponible | no disponible |

La informacion disponible solo permite senalar a DiffLocks como referencia directa, ya que PatchLocks reutiliza su arquitectura de codec de mechones y sus pesos iniciales. No se dispone de datos de rendimiento ni de especificaciones de terceros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al entrenarse con parches sinteticos de pelaje (nueve arquetipos), su generalizacion a especies o texturas fuera de esos arquetipos no esta garantizada.
- Riesgo de resultados poco realistas o geometricamente inconsistentes en vistas no cubiertas o iluminaciones atipicas; no se documentan tasas de fallo.
- El repositorio contiene solo pesos: el modelo no es utilizable sin clonar el codigo de github.com/CCdydy/PatchLocks y seguir su guia de uso.
- La licencia no esta indicada en la informacion disponible, por lo que no puede confirmarse si se permite el uso comercial. Debe verificarse antes de cualquier despliegue en produccion.
- El idioma y las capacidades textuales no aplican, ya que no es un modelo de lenguaje.
- La resolucion de dependencias (DINOv2 via torch.hub, codec de DiffLocks) puede condicionar la reproducibilidad en entornos distintos al documentado.
- El modelo esta pensado para investigacion y generacion de geometria; su integracion en produccion requiere validacion adicional de calidad y estabilidad.

## Enlaces

- HuggingFace (pesos): https://huggingface.co/zengzzy/PatchLocks
- Codigo, documentacion y guia de uso: https://github.com/CCdydy/PatchLocks
- Guia de uso: https://github.com/CCdydy/PatchLocks/blob/main/docs/USAGE.md
- Dataset: https://huggingface.co/datasets/zengzzy/PatchLocks-data
- DiffLocks (origen del codec de mechones): https://difflocks.is.tue.mpg.de/
