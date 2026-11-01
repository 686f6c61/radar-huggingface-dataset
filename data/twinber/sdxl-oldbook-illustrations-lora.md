# Twinber/sdxl-oldbook-illustrations-lora

## Resumen

Twinber/sdxl-oldbook-illustrations-lora es un adaptador LoRA de difusion de imagen desarrollado por Twinber (Daniel Aguilera Gonzalez) sobre Stable Diffusion XL 1.0 Base. Su proposito es transferir un estilo visual concreto: grabados, aguafuertes e ilustraciones de libros antiguos de los siglos XVIII y XIX, a partir de la totalidad del dataset `gigant/oldbookillustrations` (4.154 imagenes). El modelo resuelve el problema de reproducir de forma consistente una estetica historica de grabado sin necesidad de reentrenar el modelo base completo.

El adaptador se distribuye en tres variantes de rango (16, 32 y 64) que comparten la misma base arquitectonica de SDXL 1.0 pero difieren en el numero de parametros entrenados y en las capas adaptadas. La variante recomendada por el autor es la de rango 32, con unos 23,6 millones de parametros y 94,7 MB de peso. El repo ocupa 1,0 GB, lo que incluye las tres variantes y las imagenes comparativas.

La relevancia de esta ficha es acotada: se trata de un LoRA de nicho (38 descargas, 0 likes en el momento de la consulta) orientado a ilustracion editorial, diseño grafico retro y generacion de material visual con estetica de epoca. No es un modelo de lenguaje ni un modelo fundacional, sino un adaptador de estilo para text-to-image de 1024x1024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Stable Diffusion XL 1.0 Base (UNet con cross-attention) |
| Parametros totales | Variante A: ~11,8 M; Variante B: ~23,6 M; Variante C: ~47,2 M (parametros del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica a difusion; el limite practico es la longitud del prompt de texto, 77 tokens por defecto en SDXL) |
| Tipos de cuantizacion | No disponible de forma explicita; el modelo base se usa tipicamente en fp16 |
| Idiomas soportados | No disponible (el prompt de instancia esta en ingles) |
| Licencia | openrail++ |
| Formato de pesos | safetensors (archivos `sdxl_oldbook_lora_rank32_final.safetensors`, entre otros) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT aplicado sobre el UNet de Stable Diffusion XL 1.0 Base. La variante A (r=16, alpha=16) adapta solo las proyecciones de cross-attention (`to_k`, `to_q`, `to_v`, `to_out.0`) con learning rate 1e-4. La variante B (r=32, alpha=32) usa la misma configuracion de capas con rango doble. La variante C (r=64, alpha=32) anade las proyecciones FFN y reduce el learning rate a 5e-5. Los tres adaptadores se entrenaron sobre el dataset completo `gigant/oldbookillustrations`, compuesto por 4.154 grabados de los siglos XVIII y XIX.

No se documentan en la informacion disponible el numero de pasos de entrenamiento, el optimizador, el hardware utilizado ni si hubo regularizacion o tecnicas de decodificacion especulativa (no aplicables a difusion). El autor describe el trabajo como un "torneo de hiperparametros" para comparar el efecto del rango y de las capas adaptadas sobre la fidelidad al estilo. El prompt de instancia declarado es `old book illustration style, vintage engraving, detailed etching`.

## Capacidades

- Generacion text-to-image a 1024x1024 con estetica de grabado antiguo, aguafuerte e ilustracion de libro historico.
- Transferencia de estilo visual: reproduce texturas de papel, lineas de grabado y composiciones de lamina cientifica o botanica.
- Composicion de escenas historicas: retratos, bodegones, ilustraciones cientificas y escenas costumbristas.
- Aplicacion de estilo vintage a sujetos modernos (por ejemplo, un coche deportivo descrito con estetica de aguafuerte).
- Compatibilidad con el ecosistema Diffusers y con tecnicas de SDXL como schedulers DPMSolverMultistep con Karras sigmas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de vision o audio: es un modelo de difusion, no un LLM.
- Capacidad multilingue de prompt no documentada; el autor solo proporciona ejemplos en ingles.

## Casos de uso

- Ilustracion editorial historica: generar laminas con estetica de grabado del siglo XIX para libros, revistas o articulos divulgativos, usando el prompt de instancia para forzar el estilo.
- Diseño de material grafico retro: crear portadas, posters o carteles con textura de papel envejecido y lineas de aguafuerte para marcas o eventos con identidad vintage.
- Ilustracion cientifica y botanica: producir laminas de plantas, animales o instrumentos con apariencia de grabado historico, utiles en museos, herbarios divulgativos o material educativo.
- Ambientacion de proyectos narrativos: generar ilustraciones de epoca para novelas historicas, juegos de rol o contenidos de divulgacion historica.
- Aplicacion de estilo a sujetos contemporaneos: reinterpretar objetos o escenas actuales con estetica de grabado antiguo para campanas creativas o experimentos visuales.
- Prototipado rapido de direccion de arte: comparar las tres variantes (r=16, r=32, r=64) para elegir el equilibrio entre fidelidad al estilo y coste de inferencia antes de fijar una direccion visual.
- Generacion de datasets sinteticos de estilo: producir lotes de imagenes con estetica consistente para entrenar otros adaptadores o para aumentar datos en proyectos de vision artificial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una matriz comparativa visual (`comparisons/master_grid_10x4.png`) y ejemplos cualitativos (botanica, relojero, coche deportivo) sin metricas numericas como FID, CLIP score o similitud estilistica.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa entre 47,4 MB y 189,4 MB, pero requiere cargar el UNet de SDXL 1.0 Base en fp16, lo que suma aproximadamente 6,9 GB de pesos; en la practica se recomienda un minimo de 8-10 GB de VRAM para 1024x1024.
- GPU recomendadas: NVIDIA A100, H100 o L40S para lotes grandes y produccion; RTX 4090 (24 GB) para inferencia comoda en local.
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090, RTX 4080 y, con cuantizacion o atencion eficiente, en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4060 Ti 16 GB.
- Opciones de despliegue: Diffusers (via `load_lora_weights`), ComfyUI, Automatic1111/Forge y otras interfaces que soporten LoRA de SDXL; llama.cpp y Ollama no aplican porque no es un LLM.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del numero de pasos (el ejemplo usa 30 pasos con DPMSolverMultistep y guidance 7.5).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros del adaptador | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Twinber/sdxl-oldbook-illustrations-lora | LoRA sobre SDXL | 11,8 M / 23,6 M / 47,2 M | SDXL 1.0 Base | 1024x1024 | openrail++ | HuggingFace (38 descargas) |
| SDXL 1.0 Base (sin adaptador) | Modelo fundacional | No aplica | - | 1024x1024 | openrail++ | HuggingFace |
| LoRA de estilo vintage genericos sobre SDXL | LoRA sobre SDXL | Variable segun autor | SDXL 1.0 Base | 1024x1024 | Variable | HuggingFace |
| Modelos de difusion especializados en grabado (p. ej. adaptadores sobre SD 1.5) | LoRA / DreamBooth | Variable | SD 1.5 | 512x512 | Variable | HuggingFace |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el dataset de grabados de los siglos XVIII y XIX puede arrastrar sesgos historicos de representacion (genero, etnia, clase social) propios del material original.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, textos ilegibles y detalles incoherentes, especialmente en caras y manos.
- Limitaciones de idioma: no se documenta soporte multilingue; los prompts de ejemplo estan en ingles y el prompt de instancia tambien, por lo que prompts en castellano pueden rendir peor.
- Limitacion de contexto: el prompt de texto de SDXL esta limitado a 77 tokens por defecto; descripciones largas requieren trucos de prompt weighting o encadenado.
- Restricciones de licencia: openrail++ permite uso comercial con condiciones (atribucion y cumplimiento de las clausulas de uso aceptable); conviene revisar el texto completo de la licencia antes de integrarlo en produccion.
- Caveat de produccion: el modelo tiene muy poca traccion (38 descargas, 0 likes) y no hay benchmarks publicados; validar la calidad y la consistencia del estilo con un conjunto propio antes de usarlo en un flujo automatizado.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar SDXL 1.0 Base, lo que condiciona los requisitos de VRAM y la licencia combinada.

## Enlaces

- HuggingFace: https://huggingface.co/Twinber/sdxl-oldbook-illustrations-lora
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Dataset de entrenamiento: https://huggingface.co/datasets/gigant/oldbookillustrations
- Matriz comparativa visual: https://huggingface.co/Twinber/sdxl-oldbook-illustrations-lora/blob/main/comparisons/master_grid_10x4.png
- Ejemplo botanico: https://huggingface.co/Twinber/sdxl-oldbook-illustrations-lora/blob/main/comparisons/comparativa_4col_01_botanica.png
- Ejemplo relojero: https://huggingface.co/Twinber/sdxl-oldbook-illustrations-lora/blob/main/comparisons/comparativa_4col_02_relojero.png
- Ejemplo coche deportivo: https://huggingface.co/Twinber/sdxl-oldbook-illustrations-lora/blob/main/comparisons/comparativa_4col_06_coche_deportivo.png
- Documentacion de Diffusers para LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
