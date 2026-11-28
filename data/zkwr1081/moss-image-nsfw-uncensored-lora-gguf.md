# zkwr1081/Moss-image-nsfw-uncensored-lora-GGUF

## Resumen

MOSS-Image NSFW Uncensored LoRA GGUF es un adaptador LoRA para generacion de imagen por texto, publicado por el usuario zkwr1081 en Hugging Face. No es un modelo completo: se trata de una conversion a formato GGUF (F16) de los LoRA de fotografia adulta del repositorio `axiomofmind/Moss-image-nsfw-uncensored-lora`, pensada para aplicarse en tiempo de inferencia sobre el modelo base `axiomofmind/Moss-Image-SFT-GGUF`. El repositorio contiene unicamente el adaptador, con 37.158.912 parametros y un tamano de 0,2 GB.

El adaptador resuelve un problema concreto de despliegue: permite ajustar la intensidad del LoRA sin necesidad de generar un modelo fusionado para cada cuantizacion o escala del modelo base. Al estar en GGUF, se integra en el ecosistema de `stable-diffusion.cpp`, lo que facilita su uso en entornos con recursos limitados o sin GPU dedicada de gran capacidad. La arquitectura subyacente es un diffusion transformer (MOSS) con un text encoder Qwen3.5-9B, tokenizer oficial de MOSS y VAE oficial de MOSS / FLUX.2.

Su relevancia es acotada y muy especifica: cubre la generacion de imagenes de contenido adulto explicito con sujetos ficticios claramente adultos, en jurisdicciones donde ello es legal. No aporta capacidades nuevas al modelo base mas alla del estilo aprendido (trigger `moss_xvstyle`) y de la eliminacion de filtros de contenido en la generacion. La licencia declarada es Apache 2.0, aunque el uso esta restringido por las advertencias del autor sobre contenido para adultos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 16) sobre diffusion transformer MOSS; text encoder Qwen3.5-9B; VAE MOSS / FLUX.2 |
| Parametros totales | 37.158.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | F16 (GGUF); el modelo base admite Q8_0 y Q4_K_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 con 504 tensores F16, disenado para inyectarse en las capas del diffusion transformer MOSS del modelo base en tiempo de ejecucion (`--lora-apply-mode at_runtime`). No incluye el transformer base, el text encoder Qwen3.5-9B, el tokenizer ni el VAE; todos ellos deben obtenerse del repositorio `axiomofmind/Moss-Image-SFT-GGUF`. El repositorio ofrece dos checkpoints: uno de 2.000 pasos entrenado sobre 221 imagenes (archivado como `original-checkpoint-2000/` en el repositorio fuente) y otro de 1.750 pasos entrenado sobre 130 imagenes (checkpoint por defecto actual). La frase de activacion aprendida es `moss_xvstyle`, que debe colocarse al inicio del prompt.

No se dispone de informacion sobre la composicion exacta del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO; al ser un adaptador de estilo para generacion de imagen, estos datos no aplican del mismo modo que en modelos de lenguaje. La innovacion tecnica destacable es la conversion a GGUF F16 con soporte de aplicacion en runtime, que permite variar la escala del LoRA (0,7, 0,8 o 0,9) sin re-fusionar el modelo base para cada cuantizacion. El autor valido la conversion con `MOSS-Image-SFT-Q8_0.gguf` y confirmo que se aplicaron los 504/504 tensores LoRA en todas las ejecuciones.

## Capacidades

- Generacion de imagenes fotorrealistas de contenido adulto explicito con sujetos ficticios adultos, mediante el trigger `moss_xvstyle`.
- Aplicacion de un estilo de fotografia adulta (boudoir, editorial) aprendido de un conjunto de imagenes de referencia.
- Control de intensidad del adaptador en tiempo de inferencia mediante la etiqueta `<lora:...:escala>`.
- Compatibilidad con el modelo base MOSS-Image-SFT en cuantizaciones Q8_0 y Q4_K_S.
- Integracion con `stable-diffusion.cpp` mediante `sd-cli` y wrappers de PowerShell y Bash incluidos en `examples/`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues; es un adaptador de imagen, no un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de fotografia adulta editorial: el adaptador se aplica sobre el modelo base con el trigger `moss_xvstyle` y una escala de 0,7-0,8 para producir imagenes fotorrealistas de sujetos adultos ficticios en composiciones tipo boudoir, aprovechando el estilo aprendido del checkpoint de 1.750 pasos.
- Prototipado de estilos en entornos con pocos recursos: al ser un GGUF F16 de 70,9 MiB, puede cargarse junto al modelo base cuantizado en Q4_K_S o Q8_0 en `stable-diffusion.cpp`, lo que permite experimentar con el estilo sin GPUs de gran VRAM.
- Ajuste fino de intensidad sin re-fusionar: estudios que necesiten comparar escalas 0,7, 0,8 y 0,9 sobre la misma semilla y configuracion (1024x1024, 30 pasos, CFG 3, Euler/discrete, flow shift 5, seed 42) pueden hacerlo en runtime, manteniendo el modelo base intacto.
- Investigacion sobre filtrado y censura en modelos generativos: el adaptador sirve como referencia para estudiar como un LoRA puede alterar el comportamiento de un modelo SFT y que implicaciones tiene para los pipelines de moderacion.
- Despliegue en pipelines de generacion por lotes: los wrappers de `examples/` permiten automatizar la generacion con parametros fijos y aplicar el LoRA de forma consistente en cada ejecucion.
- Evaluacion comparativa de checkpoints: el repositorio incluye dos adaptadores (original de 2.000 pasos y alternativo de 1.750 pasos) que permiten comparar resultados con la misma semilla y configuracion, como documenta la tabla de validacion controlada del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye una validacion controlada cualitativa con siete prompts adultos explicitos comparando el modelo base sin LoRA, con el adaptador primario a escala 0,7 y con el checkpoint alternativo a escala 0,8, usando identicos modelo base, text encoder, VAE, resolucion 1024x1024, 30 pasos, CFG 3, muestreo Euler/discrete, flow shift 5 y seed 42. No se aportan metricas numericas (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende de la cuantizacion del modelo base MOSS (Q8_0 o Q4_K_S) y del text encoder Qwen3.5-9B, que domina el consumo.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el uso de `stable-diffusion.cpp` y cuantizaciones Q4_K_S sugiere viabilidad en GPUs de consumo, pero no se aportan datos concretos.
- Opciones de despliegue: `stable-diffusion.cpp` (build con soporte MOSS) mediante `sd-cli`; el autor valido la ruta `--lora-apply-mode at_runtime` con el modelo base Q8_0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zkwr1081/Moss-image-nsfw-uncensored-lora-GGUF | LoRA GGUF F16 sobre MOSS | 37.158.912 | no aplica | Apache 2.0 | Hugging Face |
| axiomofmind/Moss-image-nsfw-uncensored-lora | LoRA original (formato nativo) | no disponible | no aplica | no disponible | Hugging Face |
| axiomofmind/Moss-Image-SFT-GGUF | Modelo base diffusion transformer | no disponible | no aplica | no disponible | Hugging Face |

La comparativa se limita al ecosistema MOSS porque no se dispone de datos de otros adaptadores NSFW comparables en la informacion proporcionada. La diferencia principal frente al LoRA original es el formato GGUF F16 y la aplicacion en runtime, que evita fusionar el adaptador con cada cuantizacion del modelo base.

## Limitaciones y advertencias

- Contenido para adultos: el adaptador genera imagenes sexuales explicitas y esta restringido a adultos en jurisdicciones donde sea legal; prohibido su uso con menores o sujetos de edad ambigua, abuso, explotacion, coercion, imagenes no consentidas o representaciones sexualizadas de personas reales identificables sin consentimiento explicito.
- No es un modelo autonomo: requiere el transformer base MOSS, el text encoder Qwen3.5-9B, el tokenizer oficial y el VAE oficial; sin ellos no funciona.
- Dependencia de build especifico: necesita una compilacion de `stable-diffusion.cpp` con soporte MOSS; otras herramientas (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este adaptador.
- Validacion limitada: el autor solo probo CFG 3 y la ruta `at_runtime`; otras configuraciones de guidance no fueron testeadas para esta conversion GGUF.
- Riesgo de sesgos y alucinacion visual: al ser un LoRA de estilo entrenado sobre conjuntos pequenos (130 y 221 imagenes), puede reproducir sesgos de composicion, iluminacion y morfologia de esos datos.
- Licencia Apache 2.0 declarada, pero las restricciones de contenido del autor prevalecen para uso comercial y de produccion; conviene revisar la licencia del modelo base y del text encoder por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin actualizaciones desde su creacion (2026-11-28); no hay evidencia de mantenimiento ni de comunidad.
- Idiomas soportados no disponibles; los prompts de ejemplo estan en ingles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zkwr1081/Moss-image-nsfw-uncensored-lora-GGUF
- Modelo base: https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
- LoRA original: https://huggingface.co/axiomofmind/Moss-image-nsfw-uncensored-lora
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
