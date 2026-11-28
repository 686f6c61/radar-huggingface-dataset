# zkwr1081/Moss-image-psychedelic-lora-GGUF

## Resumen

MOSS-Image Psychedelic LoRA GGUF es un adaptador LoRA de bajo rango convertido al formato GGUF para su uso con el modelo base axiomofmind/Moss-Image-SFT-GGUF, un transformer de difusion para generacion de imagenes. Lo publica el usuario zkwr1081 como conversion independiente del adaptador original de axiomofmind, y su funcion es aplicar un estilo visual psychedelic-pop a las generaciones del modelo base sin necesidad de fusionar los pesos ni crear una version cuantizada distinta por cada escala.

El adaptador tiene rango 16 y alpha 16, con 504 tensores F16 y un peso de 70,9 MiB. Se aplica en tiempo de inferencia mediante stable-diffusion.cpp y una frase de activacion concreta, `moss_psychpop_style`, que debe colocarse al inicio del prompt. El repositorio contiene unicamente el adaptador: no incluye el transformer de difusion base, el text encoder Qwen3.5, el tokenizer ni el VAE, que deben obtenerse por separado.

Su relevancia es practica: permite experimentar con estilos visuales concretos sobre MOSS-Image en entornos locales con cuantizaciones GGUF, manteniendo la fuerza del adaptador ajustable sin duplicar modelos. Es una publicacion de comunidad, sin descargas ni validacion externa mas alla de la comprobacion controlada del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusion MOSS-Image |
| Parametros totales | 37.158.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a generacion de imagen) |
| Tipos de cuantizacion | F16 (unico archivo publicado) |
| Idiomas soportados | no disponible (el prompt se procesa via text encoder Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (504 tensores F16 LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16 entrenado durante 1.250 pasos sobre el modelo base MOSS-Image-SFT. Su conversion a GGUF se realizo de forma independiente a partir de `pytorch_lora_weights.safetensors` usando stable-diffusion.cpp en el commit `b13a482`, con tipo F16 y 16 hilos. El archivo resultante contiene 504 tensores LoRA en F16 con SHA-256 `C39F0479256D31B1B9F2F577705ADAABB60A69EE480BBE38F62609641022E74C`.

El modelo base es un transformer de difusion que, segun la model card, se apoya en un text encoder Qwen3.5-9B, un tokenizer oficial de MOSS y un VAE oficial de MOSS o FLUX.2. El adaptador se aplica en tiempo de ejecucion (`--lora-apply-mode at_runtime`), lo que permite ajustar la escala sin regenerar pesos fusionados. No se detallan en la informacion disponible la composicion del dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- Aplicacion de estilo psychedelic-pop a generaciones de imagen del modelo base MOSS-Image.
- Control de intensidad del estilo mediante escala LoRA; el autor recomienda empezar en 1.0, con 1.0-1.2 como rango de mejores resultados en su evaluacion local.
- Activacion mediante frase disparadora `moss_psychpop_style` al inicio del prompt.
- Compatibilidad con cuantizaciones del base como Q8_0 (validada) y Q4_K_S (misma arquitectura y objetivos LoRA).
- Aplicacion en tiempo de ejecucion sobre transformers cuantizados en stable-diffusion.cpp.
- Generacion de imagenes a 1024x1024 con muestreo Euler/discrete, CFG 3, 30 pasos y flow shift 5 en la configuracion validada.
- No incluye capacidades de texto, codigo, vision, audio, tool calling ni agentes; es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustracion editorial con estetica psicodelica: aplicar el adaptador sobre MOSS-Image para generar portadas o ilustraciones de estilo pop psicodelico con control de intensidad mediante la escala LoRA, sin reentrenar el modelo base.
- Prototipado de direccion de arte: comparar el mismo prompt con y sin el adaptador (como hace el autor con semilla 42) para evaluar rapidamente si el estilo encaja en una campana antes de invertir en un modelo fusionado.
- Exploracion creativa local: usar stable-diffusion.cpp con cuantizacion Q8_0 o Q4_K_S para generar imagenes en hardware de consumo, manteniendo el adaptador como archivo separado y ligero (70,9 MiB).
- Pruebas de estilizacion por lotes: integrar el adaptador en un pipeline de generacion por lotes con semillas y prompts fijos, ajustando la escala LoRA entre 1.0 y 1.2 para variar la fuerza del estilo.
- Investigacion sobre LoRA en difusion: estudiar el efecto de un adaptador de rango 16 sobre un transformer de difusion cuantizado, midiendo tiempos de inferencia con y sin adaptador (el autor reporta 25,93 s frente a 34,06 s de muestreo en su hardware de validacion).
- Educacion y demostraciones: mostrar en talleres como se aplica un LoRA GGUF en tiempo de ejecucion con stable-diffusion.cpp, usando los scripts de PowerShell y Bash incluidos en `examples/`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una comprobacion controlada de correctitud con la misma descripcion, modelo base, text encoder, VAE, resolucion 1024x1024, 30 pasos, CFG 3, Euler/discrete, flow shift 5 y semilla 42:

| Ejecucion | Muestreo | Extremo a extremo |
|---|---:|---:|
| SFT Q8_0 sin LoRA | 25,93 s | 30,31 s |
| SFT Q8_0 + LoRA F16 GGUF | 34,06 s | 38,49 s |

Estos tiempos se midieron en una NVIDIA RTX PRO 6000 Blackwell Max-Q y, segun el autor, son comprobaciones de correctitud, no benchmarks generales de rendimiento. En la ejecucion con adaptador, stable-diffusion.cpp reporto la aplicacion de 504 de 504 tensores LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende de la cuantizacion del transformer base MOSS-Image y del text encoder Qwen3.5-9B, no del adaptador, que solo pesa 70,9 MiB.
- GPU recomendadas: el autor valido en una NVIDIA RTX PRO 6000 Blackwell Max-Q; no se especifican otras GPU recomendadas.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el base cuantizado en Q8_0 o Q4_K_S podria caber en GPU de consumo de gama alta, pero no hay datos que lo verifiquen.
- Opciones de despliegue: stable-diffusion.cpp con soporte MOSS (compilacion especifica); se requiere ademas el transformer base en GGUF, text encoder Qwen3.5-9B, tokenizer oficial de MOSS y VAE oficial de MOSS o FLUX.2.
- Latencia y throughput: en la validacion del autor, 34,06 s de muestreo y 38,49 s extremo a extremo para una imagen de 1024x1024 con 30 pasos y LoRA a escala 1.0 en RTX PRO 6000 Blackwell Max-Q.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image Psychedelic LoRA GGUF (este) | LoRA GGUF sobre MOSS-Image | 37.158.912 | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| axiomofmind/Moss-image-psychedelic-lora | LoRA original en safetensors | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| axiomofmind/Moss-Image-SFT-GGUF | Modelo base de difusion en GGUF | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal es el formato: este repositorio ofrece el adaptador en GGUF F16 para aplicacion en tiempo de ejecucion con stable-diffusion.cpp, mientras que el original se distribuye en safetensors.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador; sin el transformer base MOSS-Image, el text encoder Qwen3.5-9B, el tokenizer y el VAE no es funcional.
- Requiere una compilacion de stable-diffusion.cpp con soporte MOSS; no se garantiza compatibilidad con otras herramientas (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Solo se ha validado con el base en Q8_0; Q4_K_S se menciona como compatible por arquitectura, pero no se confirma validacion.
- El estilo depende de la frase disparadora `moss_psychpop_style`; omitirla desactiva el efecto del adaptador.
- Riesgo de sobreestilizacion o artefactos con escalas superiores a 1.2; el autor solo evalua localmente el rango 1.0-1.2.
- No hay datos sobre sesgos, tasas de alucinacion visual ni limitaciones idiomaticas del text encoder en la informacion disponible.
- Es una conversion de comunidad no afiliada ni respaldada por OpenMOSS; la calidad y el mantenimiento dependen del autor.
- Licencia Apache 2.0 declarada, coincidente con la del modelo base y la del adaptador original, pero conviene verificar las condiciones del base y del text encoder antes de uso comercial.
- Sin descargas ni likes en el momento de la consulta; no hay validacion independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zkwr1081/Moss-image-psychedelic-lora-GGUF
- Adaptador original: https://huggingface.co/axiomofmind/Moss-image-psychedelic-lora
- Modelo base GGUF: https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
