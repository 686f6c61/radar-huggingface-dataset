# voltaire321/Ming-Image-0.2-Design-GGUF

## Resumen

Ming-Image-0.2-Design-GGUF es una conversión a formato GGUF del modelo de generación de imágenes Ming-Image-0.2-Design, desarrollado originalmente por inclusionAI y publicado en este repositorio por el usuario voltaire321. El paquete está pensado para ejecutarse con stable-diffusion.cpp y está orientado a la síntesis de imágenes con salida RGBA, es decir, con canal alfa y fondo transparente real, una capacidad poco frecuente en los modelos text-to-image de código abierto.

El modelo combina una arquitectura de difusión basada en DiT (Diffusion Transformer) de aproximadamente 6.154.901.056 parámetros con un codificador de texto derivado de Ling-mini-2.0, un modelo de lenguaje de inclusionAI. La conversión incluye dos ficheros GGUF: el modelo de difusión cuantizado en Q8_0 (6,54 GB) y el codificador de texto en Q4_K (10,52 GB). Requiere además un VAE en bf16 publicado por Comfy-Org y el tokenizer de inclusionAI.

La relevancia de esta ficha radica en que es una cuantización de un modelo reciente (0.2) que mejora sobre 0.1 en composición compleja, iluminación y renderizado de texto, y que mantiene la arquitectura intacta, por lo que stable-diffusion.cpp no necesita código nuevo. La licencia MIT de los modelos originales facilita su uso comercial, aunque el repositorio en sí es una conversión no oficial mantenida por un tercero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para el modelo de difusión; codificador de texto basado en Ling-mini-2.0 con conector y proyección MLP |
| Parametros totales | 6.154.901.056 (modelo de difusión, dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (modelo de difusión), Q4_K (codificador de texto); el repositorio original publica además int8 y w4a8 para el text encoder |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en los modelos originales) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión basada en un Diffusion Transformer (DiT) de 6B parámetros, acoplado a un codificador de texto derivado de Ling-mini-2.0. Entre ambos existe un conector y una proyección MLP (`proj_in`, `proj_out`, `proj_directvlm`, `query_tokens`) que traducen las representaciones del modelo de lenguaje al espacio latente del DiT. La generación se realiza con un scheduler y un VAE separados, el VAE en bf16 publicado por Comfy-Org.

Respecto a 0.1, la versión 0.2 retrena el DiT, el conector y la proyección MLP, mientras que el modelo de lenguaje Ling-mini-2.0, el tokenizer, el VAE, el scheduler y los ficheros de configuración permanecen idénticos. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacable es la generación nativa en RGBA con canal alfa, que permite obtener recortes con transparencia real en lugar de fondos blancos.

## Capacidades

- Generación de imágenes text-to-image con resolución de trabajo de 1024×1024 y pasos de muestreo bajos (12 pasos en el ejemplo del autor).
- Salida RGBA con canal alfa y fondo transparente, activable mediante un lienzo transparente inicial a strength 0,9 y una frase RGBA al inicio del prompt.
- Mejor composición compleja, iluminación y renderizado de texto que la versión 0.1, según las pruebas del autor de la conversión.
- Renderizado de texto en carteles con mejor ortografía que 0.1 (corrige letras que 0.1 desordenaba).
- Conservación de nitidez en estilos como pixel art.
- Recortes transparentes con bordes limpios, sin el halo blanco de 0.1.
- Soporte de sampling con método Euler, cfg-scale 1 y atención con `--diffusion-fa`.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo thinking; es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Generación de stickers y recortes de producto: la salida RGBA con fondo transparente permite obtener imágenes listas para catálogos, tiendas o interfaces sin necesidad de posprocesado de recorte, gracias al canal alfa nativo y a los bordes limpios documentados.
- Diseño de carteles con texto: la mejora en renderizado de texto respecto a 0.1 hace viable generar pósters y banners con tipografía legible, útil para prototipado rápido de material gráfico.
- Assets para videojuegos y pixel art: la nitidez en estilos pixel art y la transparencia permiten generar sprites y elementos de interfaz directamente utilizables en motores 2D.
- Prototipado de producto y e-commerce: generar variaciones de un objeto (por ejemplo, una manzana roja brillante) sobre fondo transparente para integrarlas en fichas de producto o maquetas.
- Automatización de pipelines de diseño con stable-diffusion.cpp: al ser GGUF y ejecutarse con `sd-cli`, se puede integrar en scripts de CI/CD o en herramientas como Haruspex, que descarga estos ficheros automáticamente.
- Despliegue en hardware de consumo o estaciones ROCm: el formato cuantizado Q8_0/Q4_K reduce los requisitos de memoria y permite ejecutar la generación en una GPU Radeon AI PRO R9700 con el text encoder en CPU, con tiempos de 12-15 s de muestreo por imagen a 1024×1024.
- Generación de material gráfico para presentaciones y mockups: la composición mejorada y la iluminación facilitan imágenes de concepto rápidas sin salir del flujo local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta comparaciones cualitativas entre 0.1 y 0.2 con el mismo prompt y semilla: 0.2 deletrea correctamente texto de cartel donde 0.1 fallaba una letra, mantiene el pixel art nítido y produce recortes transparentes con bordes limpios. En la prueba de transparencia, aproximadamente el 94 % de los píxeles volvieron totalmente transparentes (87 % en 0.1). En una Radeon AI PRO R9700 con ROCm y el text encoder en CPU, una imagen de 1024×1024 tarda unos 12-15 s de muestreo y 20-30 s de extremo a extremo.

## Requisitos de hardware

- VRAM estimada: los dos ficheros GGUF suman unos 17,06 GB en disco (6,54 GB el DiT Q8_0 y 10,52 GB el text encoder Q4_K); a ello se añade el VAE en bf16. La VRAM necesaria para inferencia no está documentada de forma explícita.
- GPU recomendadas: el autor ha probado en una Radeon AI PRO R9700 con ROCm. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma que quepa en GPU de consumo; el tamaño conjunto de los pesos (más de 17 GB) sugiere que requiere GPU de gama alta o bien descargar el text encoder a CPU.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli`), con builds `master-1142` o superiores (las builds `master-1116` a `master-1141` confunden Ming-Image con Z-Image y no funcionan correctamente). También se puede usar a través de Haruspex, que descarga estos ficheros. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de difusión de este tipo.
- Latencia y throughput: 12-15 s de muestreo y 20-30 s de extremo a extremo por imagen de 1024×1024 en Radeon AI PRO R9700 con el text encoder en CPU, con 12 pasos y cfg-scale 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida RGBA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ming-Image-0.2-Design (GGUF, este repo) | 6,15 B (DiT) + text encoder Ling-mini-2.0 | no disponible | Sí, nativa | MIT | GGUF en HF; original en safetensors en inclusionAI y Comfy-Org |
| Ming-Image-0.1-Design | no disponible | no disponible | Sí (87 % de píxeles transparentes en la prueba) | MIT | GGUF en voltaire321; original en inclusionAI y Comfy-Org |
| Z-Image | no disponible | no disponible | no disponible | no disponible | Referenciado solo por el conflicto de detección en stable-diffusion.cpp |

La comparativa se limita a la versión anterior del mismo modelo, ya que la información disponible no incluye datos de otros modelos text-to-image comparables en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es una conversión no oficial realizada por un tercero (voltaire321); todo el crédito del modelo corresponde a inclusionAI. No hay fine-tuning ni merging, solo cuantización.
- El text encoder se construyó parcheando el fichero bf16 de 0.1 con los tensores de conector y MLP de 0.2, ya que Comfy-Org solo publica el text encoder de 0.2 en int8 y w4a8. El autor verificó el procedimiento contra el fichero de 0.1 con resultado bit-idéntico, pero es un proceso manual.
- Hay que usar el text encoder de 0.2 con el modelo de difusión de 0.2; el text encoder de 0.1 carga pero produce imágenes visiblemente distintas porque el conector cambió.
- Las builds de stable-diffusion.cpp entre `master-1116` y `master-1141` no funcionan correctamente con este modelo; es necesario `master-1142` o superior, o una build anterior a `master-1116`.
- La transparencia no es perfecta: en la prueba del autor, aproximadamente el 6 % de los píxeles no quedaron totalmente transparentes.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, idiomas soportados ni limitaciones de contexto.
- La licencia MIT de los modelos originales permite uso comercial, pero conviene revisar los términos del repositorio de conversión y de los componentes de terceros (VAE de Comfy-Org, tokenizer de inclusionAI).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validación por la comunidad es aún inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voltaire321/Ming-Image-0.2-Design-GGUF
- Modelo original: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- Modelo de lenguaje base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Conversión 0.1 del mismo autor: https://huggingface.co/voltaire321/Ming-Image-0.1-Design-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Haruspex: https://github.com/tmac1973/haruspex
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Ming-Image/blob/main/vae/ming_image_vae_bf16.safetensors
- Tokenizer (inclusionAI): https://huggingface.co/inclusionAI/Ming-Image-0.2-Design/blob/main/mllm/tokenizer.json
- Modelo de difusión bf16 (Comfy-Org): https://huggingface.co/Comfy-Org/Ming-Image/blob/main/diffusion_models/ming_image_0.2_design_bf16.safetensors
- Text encoder 0.1 bf16 (Comfy-Org): https://huggingface.co/Comfy-Org/Ming-Image/blob/main/text_encoders/ming_image_0.1_ling_mini_2.0_bf16.safetensors
- Licencia de Ling-V2: https://github.com/inclusionAI/Ling-V2/blob/master/LICENCE
