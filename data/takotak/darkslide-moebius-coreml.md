# Takotak/darkslide-moebius-coreml

## Resumen

Darkslide Moebius CoreML es una conversión a Core ML del modelo de eliminación de objetos Moebius (hustvl), empaquetada para su uso dentro de Darkslide, un editor de imágenes RAW para macOS. El modelo recibe una imagen de 512 × 512 píxeles junto con una máscara binaria que indica la región a eliminar y genera un relleno coherente con el entorno circundante. No acepta entrada de texto ni está pensado para ninguna otra tarea que la eliminación de objetos por inpainting.

La arquitectura subyacente es un pipeline de difusión latente compuesto por tres programas Core ML: un codificador VAE (SDXL VAE, licencia MIT), un U-Net basado en Moebius con veinte identificadores de condicionamiento preintegrados y un decodificador VAE. Los pesos están en fp16, la resolución de trabajo es de 512 × 512 píxeles y los latentes son de 64 × 64. El muestreo se realiza con DDIM, betas lineales escaladas entre 0,00085 y 0,012, 10 pasos (saltando el primero), guiado 2,0 y un desplazamiento de ruido de 0,0357.

Su relevancia es acotada pero concreta: permite ejecutar eliminación de objetos en local sobre hardware Apple (Mac) sin depender de servicios en la nube, lo que encaja con flujos de edición fotográfica profesional donde la privacidad y la latencia importan. El repositorio ocupa 0,6 GB y se distribuye bajo licencia Apache 2.0, aunque los pesos originales se afinaron sobre Places2, cuyos términos de descarga de imágenes están limitados a investigación y educación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (VAE + U-Net + VAE decoder) convertida a Core ML |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada 512 × 512 px, latentes 64 × 64) |
| Tipos de cuantización | fp16 (pesos de los tres ML Programs) |
| Idiomas soportados | no aplica (sin entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`.mlpackage` dentro de `moebius-ft_places2-512-coreml.zip`) |

## Arquitectura y entrenamiento

El modelo es una adaptación del trabajo Moebius de hustvl (ECCV 2026), en concreto de los pesos `ft_places2`, cuyo código y pesos originales se publican bajo Apache 2.0. El pipeline consta de tres etapas: `vae_encoder.mlpackage` transforma una imagen 1×3×512×512 en el rango −1…1 a un latente 1×4×64×64 multiplicado por 0,13025; `unet.mlpackage` recibe el latente, una máscara 1×1×64×64, el latente enmascarado, un `timestep` int32 y un escalar de `guidance`, y devuelve el ruido predicho con guiado libre de clasificador; `vae_decoder.mlpackage` reconstruye la imagen 1×3×512×512 en el rango 0…1. El U-Net lleva integrados los veinte identificadores de condicionamiento de Moebius (10–19 incondicionales, 0–9 condicionales).

El muestreo es DDIM con betas lineales escaladas de 0,00085 a 0,012, 10 pasos saltando el primero, guiado 2,0 y desplazamiento de ruido de 0,0357. El VAE procede de SDXL VAE (Stability AI, MIT), tal como se distribuye con PixelHacker. La conversión a Core ML se realizó con coremltools 9. Los pesos `ft_places2` se afinaron sobre Places2 (Places365); no se emplean los afinados sobre CelebA-HQ ni FFHQ. No se dispone de información sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO, dado que no es un modelo de lenguaje.

## Capacidades

- Eliminación de objetos por inpainting: rellena la región marcada por la máscara a partir del contexto circundante de la imagen.
- Entrada imagen-a-imagen con máscara binaria de 64 × 64 latentes (equivalente a 512 × 512 píxeles).
- Ejecución local en Mac mediante Core ML, sin conexión a servicios externos.
- Integración en un flujo de edición RAW dentro de Darkslide.
- No admite tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa texto).
- Sin modo de pensamiento, visión general, audio ni otras modalidades.

## Casos de uso

- Eliminación de objetos no deseados en fotografías RAW: el fotógrafo marca la región a borrar y el modelo la rellena con el entorno, todo en local en su Mac, lo que evita subir imágenes a la nube.
- Limpieza de fondos en fotografía de producto: se eliminan elementos accesorios (cables, etiquetas, reflejos) antes de la entrega al cliente, manteniendo la coherencia de iluminación y textura.
- Restauración de fotografías de paisaje: se retiran personas o vehículos que aparecen en la escena sin recurrir a recortes que alteren el encuadre.
- Edición rápida en flujos de retoque profesional: al integrarse en Darkslide, el modelo permite iterar sobre la máscara y regenerar el relleno sin salir de la aplicación, reduciendo el cambio de contexto.
- Preparación de material para archivo o publicación: se eliminan marcas temporales o elementos distractores antes de exportar la imagen final.
- Privacidad en edición sensible: al ejecutarse en Core ML sobre el equipo del usuario, resulta adecuado para imágenes que no pueden salir del entorno local (retratos, documentos, material bajo confidencialidad).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en local sobre macOS mediante Core ML; requiere hardware Apple compatible con ML Programs (Apple Silicon recomendado, no especificado en la información disponible).
- VRAM estimada: no disponible. El repositorio ocupa 0,6 GB y los pesos están en fp16, lo que sugiere un consumo moderado, pero no se han publicado cifras de memoria en ejecución.
- GPU recomendadas: no disponible; el modelo está pensado para GPUs integradas de Apple, no para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible para GPUs NVIDIA o AMD; el formato Core ML limita el despliegue a hardware Apple.
- Opciones de despliegue: Core ML (coremltools 9); no se proporcionan pesos en safetensors, GGUF ni otros formatos, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darkslide Moebius CoreML | Difusión latente (Core ML) | 512 × 512 px | Imagen + máscara | Apache 2.0 | Hugging Face (Core ML) |
| Moebius (hustvl) | Difusión latente | no disponible | Imagen + máscara | Apache 2.0 | Repositorio GitHub de hustvl |
| SDXL VAE (Stability AI) | VAE | no disponible | Imagen / latente | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en eliminación de objetos; no sirve para generación de texto, código, matemáticas ni otras tareas.
- Sin entrada de texto: no admite instrucciones en lenguaje natural.
- Resolución fija de 512 × 512 píxeles; imágenes mayores requerirán redimensionado o parcheo externo.
- Dependencia de Core ML: solo se ejecuta en el ecosistema Apple, lo que limita su portabilidad a Linux o Windows.
- Los pesos `ft_places2` se afinaron sobre Places2 (Places365), cuyos términos de descarga de imágenes están limitados a investigación y educación no comercial; aunque la licencia del modelo es Apache 2.0, conviene revisar las implicaciones para uso comercial.
- Riesgo de artefactos o rellenos incoherentes en regiones grandes o con texturas complejas; no se han publicado métricas de calidad (FID, LPIPS) en la información disponible.
- No se han documentado sesgos específicos, pero al entrenarse sobre Places2 puede heredar sesgos de composición y escenas de ese conjunto.
- Repositorio sin descargas ni interacciones (0 descargas, 0 likes) en el momento de la consulta; soporte comunitario limitado.
- El archivo se distribuye como ZIP con SHA-256 `a4a8e1bbad685883a96682f08e7e9ef0754a3318b5d0c1deb932370c1a2e53d6`; conviene verificarlo antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Takotak/darkslide-moebius-coreml
- Moebius (código y pesos originales): https://github.com/hustvl/Moebius
- SDXL VAE: https://huggingface.co/stabilityai/sdxl-vae
- Darkslide: https://darkslide.aaperture.com
