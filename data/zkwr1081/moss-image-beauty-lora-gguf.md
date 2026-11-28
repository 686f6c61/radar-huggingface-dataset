# zkwr1081/Moss-image-beauty-lora-GGUF

## Resumen

MOSS-Image Beauty LoRA GGUF es un adaptador LoRA de bajo rango para generación de imágenes texto-a-imagen, especializado en retratos de estudio y fotografía de belleza editorial. Lo publica el usuario zkwr1081 en Hugging Face como conversión a formato GGUF de los checkpoints LoRA originales de axiomofmind/Moss-image-beauty-lora, pensados para aplicarse en tiempo de inferencia sobre el modelo base axiomofmind/Moss-Image-SFT-GGUF. No es un modelo completo, sino un complemento de 37.158.912 parámetros (unos 70,9 MiB por fichero) que modifica el comportamiento del transformer de difusión base.

El adaptador está diseñado para reforzar un estilo concreto: primeros planos pulidos, iluminación suave y dirigida, detalle en piel y cabello, fondos contenidos y una estética de fotografía de belleza editorial. Se distribuye en dos variantes F16 (checkpoint primario en el paso 2000 y alternativo en el paso 1750), ambas con rango 16 y alpha 16, y con la frase disparadora `moss_beauty_style` que debe colocarse al inicio del prompt.

Su relevancia práctica es que permite ajustar la fuerza del adaptador sin necesidad de fusionar pesos ni regenerar una versión del modelo base por cada cuantización o escala. Está validado con stable-diffusion.cpp sobre el base en Q8_0, empleando el codificador de texto Qwen3.5-9B, el tokenizer oficial de MOSS y el VAE oficial de MOSS / FLUX.2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión MOSS-Image |
| Parametros totales | 37.158.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | F16 (ambos checkpoints); el base admite Q8_0 y Q4_K_S |
| Idiomas soportados | no disponible (condicionado por el codificador de texto Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 que se inyecta en tiempo de ejecución sobre el transformer de difusión del modelo base MOSS-Image-SFT. Consta de 504 tensores LoRA en F16 por checkpoint, con un tamaño de 70,9 MiB cada uno. No incluye el transformer de difusión base, ni el codificador de texto Qwen3.5-9B, ni el tokenizer, ni el VAE: todos ellos deben obtenerse por separado del repositorio del modelo base.

El checkpoint primario se entrenó sobre 176 imágenes y se seleccionó en el paso 2000; el alternativo se entrenó sobre un conjunto más focalizado de 149 imágenes y se seleccionó en el paso 1750. La frase disparadora es `moss_beauty_style`. La validación se realizó con stable-diffusion.cpp aplicando los 504 tensores LoRA sobre el base Q8_0, con resolución 1024×1024, 30 pasos, CFG 3, muestreo Euler/discrete, flow shift 5 y semilla 42, reproduciendo el comportamiento observado en las imágenes de referencia del repositorio de safetensors original.

## Capacidades

- Generación de imágenes texto-a-imagen con estética de retrato de belleza editorial.
- Refuerzo de primeros planos con iluminación suave y dirigida, detalle de piel y cabello y fondos contenidos.
- Aplicación en tiempo de inferencia con fuerza del adaptador ajustable mediante la etiqueta `<lora:...:escala>`.
- Compatibilidad con el pipeline de stable-diffusion.cpp con soporte MOSS.
- Dos variantes de estilo seleccionables (primaria y alternativa) con la misma frase disparadora.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un adaptador de imagen, no un modelo de lenguaje.
- Capacidades multilingües no documentadas; la condicionalidad textual depende del codificador Qwen3.5-9B.

## Casos de uso

- Retratos de estudio para agencias y portfolios: el adaptador refuerza primeros planos pulidos con luz dirigida y detalle de piel, adecuado para generar variaciones de un mismo retrato manteniendo coherencia de estilo con la semilla fija.
- Fotografía de belleza editorial para revistas o catálogos: la estética de fondos contenidos y luz suave encaja con maquetación editorial, y la escala del LoRA permite modular la intensidad del acabado.
- Pruebas de concepto de dirección de arte: permite comparar el mismo prompt con y sin adaptador (y entre las dos variantes) para decidir el look final antes de una producción real.
- Generación de avatares y retratos de perfil: la variante primaria, entrenada con 176 imágenes, ofrece un acabado consistente para imágenes cuadradas de 1024×1024.
- Iteración de prompts en local con hardware modesto: al ser un LoRA F16 de 70,9 MiB, se carga junto al base cuantizado en stable-diffusion.cpp sin necesidad de fusionar pesos.
- Experimentación con fuerza de condicionamiento: la escala ajustable en la etiqueta `<lora:...>` permite desde un toque sutil hasta una aplicación plena (escala 1.0 recomendada para la variante alternativa), útil para calibrar el estilo en pipelines de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta una validación cualitativa controlada con stable-diffusion.cpp (504/504 tensores LoRA aplicados, misma semilla y parámetros en las tres columnas comparadas) y comparaciones visuales stock frente a adaptador, sin métricas numéricas.

## Requisitos de hardware

- El adaptador en sí ocupa 70,9 MiB por checkpoint en F16; el requisito real lo marca el modelo base MOSS-Image-SFT más el codificador Qwen3.5-9B y el VAE.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende de la cuantización del base (Q8_0 validado, Q4_K_S compatible) y del codificador de texto.
- GPU recomendadas: no disponible; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el uso de Q4_K_S del base sugiere que se busca reducir el consumo, pero no se aportan cifras.
- Despliegue: stable-diffusion.cpp con soporte MOSS (compilación habilitada para MOSS), aplicando el LoRA en tiempo de ejecución con `--lora-apply-mode at_runtime`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image Beauty LoRA GGUF (este) | LoRA GGUF sobre MOSS-Image | 37.158.912 | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| axiomofmind/Moss-image-beauty-lora | LoRA en safetensors (origen) | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| axiomofmind/Moss-Image-SFT-GGUF | Modelo base completo en GGUF | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin el transformer base MOSS-Image-SFT, el codificador Qwen3.5-9B, el tokenizer y el VAE no produce imágenes.
- Requiere una compilación de stable-diffusion.cpp con soporte MOSS; otras herramientas (vLLM, Ollama, TGI) no aplican a este pipeline de difusión.
- El estilo está fuertemente sesgado hacia retratos de belleza editorial; puede arrastrar ese look incluso cuando el prompt pide otra cosa, y la escala debe ajustarse para evitarlo.
- Entrenado con conjuntos pequeños (176 y 149 imágenes), lo que limita la diversidad de sujetos, poses y condiciones de luz representadas.
- Riesgo de sobreajuste al estilo y de degradación de la coherencia anatómica fuera del dominio de retrato.
- Sesgos demográficos y estéticos no documentados; la composición del dataset de entrenamiento no se detalla.
- Licencia Apache 2.0 declarada, pero la licencia y condiciones del modelo base deben verificarse por separado antes de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zkwr1081/Moss-image-beauty-lora-GGUF
- LoRA original en safetensors: https://huggingface.co/axiomofmind/Moss-image-beauty-lora
- Modelo base GGUF: https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
