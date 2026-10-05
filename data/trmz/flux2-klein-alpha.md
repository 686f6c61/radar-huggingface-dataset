# trmz/flux2-klein-alpha

## Resumen

FLUX.2 Klein Alpha es un paquete de pesos publicado por Xavier Jara (usuario `trmz` en HuggingFace) que dota a la familia FLUX.2 Klein de Black Forest Labs de capacidad nativa de generar imagenes con canal alfa (RGBA). No es un modelo de lenguaje ni un modelo base completo: el repositorio contiene un VAE RGBA especifico para FLUX.2 y tres adaptadores LoRA que se aplican sobre los modelos base `black-forest-labs/FLUX.2-klein-base-4B` y `black-forest-labs/FLUX.2-klein-base-9B`. El problema que resuelve es concreto: extraer el primer plano de una imagen como PNG transparente conservando bordes suaves, sombras y transparencia parcial, algo que los modelos de difusion habituales no hacen bien porque su VAE decodifica en RGB de tres canales.

El repositorio incluye cuatro artefactos descargables: `vae/` (VAE RGBA para FLUX.2), `loras/extract_4b.safetensors` (extractor de primer plano para Klein Base 4B), `loras/extract_9b.safetensors` (extractor para Klein Base 9B) y `loras/remove_9b.safetensors` (eliminacion de objetos para Klein Base 9B). El metodo del VAE se basa en AlphaVAE, y el entrenamiento e inferencia se realizaron con ai-toolkit. El flujo de uso previsto es sencillo: prompt `Foreground`, guidance 4 y seis pasos de inferencia con cualquiera de los dos extractores.

Su relevancia ahora es practica: ofrece una alternativa abierta y ligera a los servicios comerciales de segmentacion y recorte (background removal) manteniendo el control sobre el pipeline, con la ventaja de generar la transparencia dentro del propio proceso de difusion en lugar de recurrir a un matteo posterior. El repositorio ocupa 0,9 GB y acumulaba 11 likes en el momento de la consulta, con 0 descargas registradas, lo que indica un proyecto reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (familia FLUX.2 Klein de Black Forest Labs) con VAE RGBA de cuatro canales sustituyendo al VAE RGB; los adaptadores son LoRA |
| Parametros totales | No disponible para los artefactos del repositorio (adaptadores LoRA y VAE). Los modelos base asociados son de 4B y 9B parametros |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de imagen); la longitud de prompt no esta documentada |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; no se documentan variantes GGUF, FP8 ni cuantizaciones de menor precision |
| Idiomas soportados | No disponibles. El unico prompt documentado es `Foreground`, en ingles; el autor no especifica cobertura multilingue |
| Licencia | Licencias por componente: VAE RGBA y `extract_4b` bajo Apache 2.0 (uso comercial permitido); adaptadores de 9B (`extract_9b`, `remove_9b`) bajo FLUX Non-Commercial License. Enlace: NOTICE.md y LICENSE.md |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 0,9 GB |
| Modelos base | `black-forest-labs/FLUX.2-klein-base-4B` y `black-forest-labs/FLUX.2-klein-base-9B` |
| Libreria / herramienta | ai-toolkit (entrenamiento e inferencia); compatibilidad declarada con diffusers |

## Arquitectura y entrenamiento

La pieza tecnica diferencial es el VAE RGBA: frente al VAE de tres canales de FLUX.2, este decodifica cuatro canales (rojo, verde, azul y alfa), de modo que la transparencia se produce de forma nativa durante la difusion en lugar de estimarse a posteriori con un modelo de matting. El metodo sigue el enfoque AlphaVAE (paper arXiv:2507.09308), que el autor cita explicitamente como base del VAE. Sobre ese VAE se entrenaron tres adaptadores LoRA: dos extractores de primer plano (uno para el backbone de 4B y otro para el de 9B) y un adaptador de eliminacion de objetos para el backbone de 9B.

No se documentan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, la resolucion de entrenamiento ni si se aplicaron fases de ajuste por preferencias (RLHF o DPO). Tampoco se especifican los hiperparametros del entrenamiento con ai-toolkit mas alla del regimen de inferencia recomendado: prompt `Foreground`, guidance 4 y seis pasos, identico para ambos extractores. El demo descrito en la model card incorpora un selector de extractor 4B/9B y un modo de fondo automatico que genera el fondo de un objeto marcado y despues lo extrae como RGBA; tambien admite proporcionar directamente un compuesto y su fondo.

## Capacidades

- Generacion de imagenes RGBA con canal alfa real, no una mascara binaria: preserva bordes suaves, sombras proyectadas y transparencia parcial (semitransparencia en cristales, humo o cabello).
- Extraccion de primer plano (background removal) a partir de una imagen, un compuesto o un par compuesto-fondo, usando el prompt `Foreground` y seis pasos de inferencia.
- Dos niveles de calidad y coste segun el backbone: extractor para Klein Base 4B y extractor para Klein Base 9B, seleccionables en el mismo demo.
- Eliminacion de objetos sobre FLUX.2 Klein Base 9B mediante el adaptador `remove_9b.safetensors`.
- Modo de fondo automatico: a partir de un objeto marcado, genera su fondo y despues realiza la extraccion RGBA.
- Edicion unificada: al apoyarse en la familia FLUX.2 Klein, hereda la capacidad de generacion y edicion en un unico modelo compacto descrita por Black Forest Labs para esa familia.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio o video. No es un modelo de texto: su entrada textual se limita a prompts de condicionamiento.

## Casos de uso

- Recorte de producto para comercio electronico: extraer el articulo con sombra suave incluida y exportarlo como PNG transparente para catalogos y fichas de producto, evitando el borde duro tipico de una mascara binaria.
- Retoque fotografico profesional: generar una capa alfa con transparencia parcial para cabello, encaje o cristal, de forma que el composite posterior sobre un fondo nuevo no muestre halos.
- Diseno grafico y plantillas: producir assets con alfa listos para maquetacion en herramientas de diseno, partiendo de una imagen generada o de una fotografia existente.
- Automatizacion de pipelines de contenido: integrar la extraccion en un flujo por lotes que reciba imagenes y devuelva PNG RGBA, sustituyendo servicios de segmentacion en la nube por inferencia local.
- Creacion de datasets de vision por computador: generar pares imagen/mascara alfa de alta calidad para entrenar o evaluar modelos de segmentacion y matting.
- Composicion y postproduccion audiovisual: usar la extraccion RGBA para preparar elementos que se compondran sobre placas de fondo, aprovechando el modo de fondo automatico cuando no se dispone de una placa limpia.
- Eliminacion de objetos en fotografia de interiores o inmobiliaria: retirar muebles, carteles o elementos no deseados con el adaptador `remove_9b` sobre Klein Base 9B.
- Prototipado de herramientas creativas: el tamano reducido del repositorio (0,9 GB) y la licencia Apache 2.0 del VAE y del extractor de 4B facilitan incorporarlos a demos y productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con FID, CLIP, IoU, SAD ni metricas de matting, y el material de busqueda no aporta cifras. El unico dato operativo documentado es el regimen de inferencia: guidance 4 y seis pasos para ambos extractores.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia derivada del recuento de parametros y no de mediciones oficiales, el backbone de 4B en bf16 ronda los 8 GB solo en pesos, y el de 9B unos 18 GB; a esa cifra hay que sumar el VAE RGBA, el codificador de texto y las activaciones. Se trata de una estimacion, no de un dato confirmado.
- GPU recomendadas: no disponibles. Por tamano, un backbone de 4B es plausible en GPUs de 16-24 GB (RTX 4090, A5000, L40S) y un backbone de 9B encaja mejor en GPUs de 24-48 GB (A6000, L40S, A100 40 GB) o requiere descarga de capas a CPU.
- Cabe en GPU de consumo: el extractor de 4B es el candidato razonable para una GPU de consumo de 24 GB; el de 9B en bf16 queda ajustado o fuera de rango en 24 GB segun el resto del pipeline. Sin cifras oficiales de consumo de memoria, esta afirmacion es orientativa.
- Opciones de despliegue: ai-toolkit para entrenamiento e inferencia (herramienta usada por el autor), diffusers (etiqueta declarada en el repositorio) y el demo Gradio del repositorio de GitHub. vLLM, llama.cpp, Ollama y TGI no son aplicables a un modelo de difusion de imagen.
- Latencia y throughput: no disponibles. El uso de seis pasos de inferencia sugiere un coste bajo en comparacion con pipelines de 20-50 pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trmz/flux2-klein-alpha | VAE RGBA + LoRA sobre FLUX.2 Klein | Adaptadores (base 4B/9B) | No aplicable | Por componente: Apache 2.0 (VAE y 4B) y FLUX Non-Commercial (9B) | HuggingFace, 0,9 GB |
| black-forest-labs/FLUX.2-klein-base-4B | Modelo base de generacion y edicion de imagen | 4B | No aplicable | No disponible en la informacion recogida | HuggingFace |
| black-forest-labs/FLUX.2-klein-base-9B | Modelo base de generacion y edicion de imagen | 9B | No aplicable | No disponible en la informacion recogida | HuggingFace |
| Lightricks/LTX-2.5-22b-IC-LoRA-Clean-Plate | LoRA de placa limpia sobre LTX-2.5 | 22B (modelo base) | No aplicable | No disponible en la informacion recogida | HuggingFace |
| lrzjason/ObjectRemovalFluxFill | Eliminacion de objetos sobre FLUX Fill | No disponible | No aplicable | No disponible en la informacion recogida | HuggingFace |

La comparacion cuantitativa de rendimiento entre estas alternativas no esta disponible: no se han publicado metricas comunes en la informacion recogida.

## Limitaciones y advertencias

- La licencia es mixta y restrictiva en parte del paquete: el VAE RGBA y `extract_4b` son Apache 2.0 y comercializables, pero `extract_9b` y `remove_9b` quedan bajo FLUX Non-Commercial License. Usar el extractor de 9B en produccion comercial exige revisar LICENSE.md y NOTICE.md.
- El repositorio no incluye los modelos base: es necesario descargar aparte FLUX.2 Klein Base 4B o 9B y cumplir sus propias condiciones de licencia, que no se detallan en la informacion disponible.
- Riesgo de artefactos en el canal alfa: al ser un modelo generativo, la mascara alfa puede presentar imprecisiones en bordes complejos (cabello fino, rejillas, movimiento) o inventar transparencia donde no la hay. No se documentan evaluaciones cuantitativas de fidelidad del matting.
- El campo `inference: false` de la model card indica que el autor no declara el repositorio como listo para inferencia directa; el uso previsto pasa por el pipeline de ai-toolkit o el demo de GitHub.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni cobertura de idiomas en los prompts, lo que impide evaluar sesgos sistematicos por tipo de objeto, cultura o demografia.
- Poca madurez y adopcion: 0 descargas y 11 likes en el momento de la consulta, con repositorio creado el 29 de septiembre de 2026 y actualizado el 4 de octubre de 2026. Es un proyecto muy reciente, sin garantias de mantenimiento.
- Sin benchmarks publicos no es posible comparar objetivamente su calidad frente a soluciones especializadas de segmentacion y matting, ni frente a servicios comerciales de recorte.
- No se documentan resoluciones maximas de imagen soportadas ni limites de tamano de entrada, lo que obliga a validar el comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trmz/flux2-klein-alpha
- Codigo y demo en GitHub: https://github.com/TR-MZ/flux2-klein-alpha
- Pagina del paper: https://tr-mz.github.io/papers/flux2-klein-alpha/
- PDF del paper: https://tr-mz.github.io/papers/flux2-klein-alpha/paper.pdf
- Paper de AlphaVAE (metodo del VAE): https://arxiv.org/abs/2507.09308
- Modelo base FLUX.2 Klein Base 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Modelo base FLUX.2 Klein Base 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-9B
- Anuncio de FLUX.2 y del VAE de Black Forest Labs: https://bfl.ai/blog/flux-2
- ai-toolkit (entrenamiento e inferencia): https://github.com/ostris/ai-toolkit
- Aviso de licencias por componente: https://huggingface.co/trmz/flux2-klein-alpha/blob/main/NOTICE.md
- Licencia FLUX Non-Commercial: https://huggingface.co/trmz/flux2-klein-alpha/blob/main/LICENSE.md
- Hilo en Reddit sobre el modelo: https://www.reddit.com/r/huggingface/comments/1wtib07/i_made_flux2_klein_output_real_transparent_images/
