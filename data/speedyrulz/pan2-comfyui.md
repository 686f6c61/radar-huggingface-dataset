# speedyrulz/PAN2-ComfyUI

## Resumen

PAN2-ComfyUI es un repositorio de scripts de conversion publicado por el usuario speedyrulz que transforma el modelo de difusion IFM/PAN2 (distribuido en formato diffusers, unos 81 GiB) en archivos `.safetensors` unicos y cuantizados listos para cargarse en ComfyUI. No es un modelo entrenado por el autor, sino una herramienta de empaquetado y cuantizacion que facilita el despliegue del modelo original en flujos de trabajo de generacion de imagen.

El repositorio incluye dos scripts: `convert_pan2.py`, que descarga los pesos originales y genera variantes en int8 ConvRot y NVFP4 junto con el text encoder y el VAE, y `verify_pan2.py`, que comprueba la integridad de los tensores y el error de cuantizacion. El modelo subyacente, PAN2, es un modelo de difusion con un text encoder basado en Qwen3.5-9B, lo que situa la carga total en decenas de gigabytes y lo hace dependiente de GPU con VRAM abundante o de cuantizacion agresiva.

Su relevancia es practica: permite a usuarios de ComfyUI acceder a PAN2 sin manejar la estructura diffusers completa ni escribir codigo de carga personalizado, a costa de requerir una build de ComfyUI con soporte especifico para PAN2 (el autor mantiene un fork). El repositorio ocupa 104 GB e incluye los pesos convertidos ademas de los scripts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) con text encoder Qwen3.5-9B y VAE; estructura diffusers |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 ConvRot, NVFP4 (4 bits e2m1), fp16 (VAE) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (PAN2 se distribuye bajo licencia propia de IFM; consultar la model page original) |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: empaqueta y cuantiza el release IFM/PAN2. La arquitectura subyacente es un modelo de difusion con un transformer principal, un text encoder Qwen3.5-9B y un VAE en layout diffusers. El script de conversion cuantiza las matrices 2-D grandes de los bloques del transformer y del "text refiner" (y de las capas del text encoder), y copia el resto de tensores sin modificar.

La innovacion tecnica esta en el esquema de cuantizacion. int8 ConvRot aplica a cada peso una rotacion mediante una matriz de Hadamard de bloques de tamano 256 y lo almacena como int8 con una escala por fila de salida, con un error relativo medido de aproximadamente 0,9% por capa. NVFP4 usa valores de 4 bits e2m1 con una escala fp8 por bloque de 16 y una escala fp32 por tensor, con un error de aproximadamente 9%. En el text encoder NVFP4, las capas se marcan como `full_precision_matrix_mult` y la tabla de embeddings de tokens se guarda como int8 por filas. El `config.json` original se conserva en los metadatos del archivo. No se dispone de informacion sobre datos de entrenamiento, tokens, RLHF o DPO del modelo original.

## Capacidades

- Generacion de imagenes mediante difusion, con el transformer PAN2 y su VAE.
- Codificacion de prompts de texto mediante el text encoder Qwen3.5-9B incluido en el paquete.
- Conversion de pesos a formatos cuantizados int8 y NVFP4 con verificacion de integridad tensor a tensor.
- Ejecucion nativa de NVFP4 en GPUs de la serie RTX 50; emulacion en el resto de hardware.
- Conversion sin GPU: el script funciona en CPU con 16 GiB de RAM o mas.
- Verificacion de que los tensores no cuantizados son identicos bit a bit al original y reporte del error de las capas cuantizadas.
- Integracion con ComfyUI mediante los nodos Load Diffusion Model, Load CLIP (tipo `pan2`) y Load VAE.
- No se dispone de informacion sobre tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Despliegue de PAN2 en ComfyUI: generar los `.safetensors` con `convert_pan2.py --out /ruta/ComfyUI/models` y cargarlos directamente en los nodos estandar, evitando manejar la estructura diffusers de 81 GiB.
- Ahorro de VRAM en GPUs de consumo: usar la variante NVFP4 de 15,5 GiB del transformer frente a los 63 GiB de pesos originales, con un error de cuantizacion de aproximadamente 9%.
- Ejecucion nativa en RTX 50: la variante NVFP4 se ejecuta sin emulacion en GPUs Blackwell, apropiada para estaciones con una sola tarjeta de gama alta.
- Mayor fidelidad con menor compresion: la variante int8 ConvRot de 39,8 GiB (error ~0,9%) es adecuada cuando se prioriza calidad sobre VRAM y se dispone de GPU con 48 GB o mas.
- Pipelines reproducibles en CI: ejecutar la conversion en CPU sin GPU y verificar con `verify_pan2.py` que los tensores no cuantizados son identicos al original antes de publicar artefactos.
- Conversion selectiva: generar solo `transformer_nvfp4`, `te_nvfp4` y `vae_fp16` con `--only` para minimizar el espacio en disco y el tiempo de descarga.
- Auditoria de cuantizacion: medir el error por capa con el verificador para decidir entre int8 y NVFP4 segun la tolerancia del flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es el error relativo de pesos por capa frente al original: aproximadamente 0,9% para int8 ConvRot y aproximadamente 9% para NVFP4. El autor indica que cada archivo de transformer tarda unos diez minutos en un CPU de escritorio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; como referencia, el transformer ocupa 15,5 GiB en NVFP4, 27,4 GiB en int8 completo y 39,8 GiB en int8 con capas fp32, a lo que se suma el text encoder (4,6 GiB NVFP4 o 8,4 GiB int8) y el VAE (1,3 GiB fp16).
- GPU recomendadas: RTX 50 (Blackwell) para ejecucion nativa de NVFP4; A100/H100 de 80 GB para las variantes int8 sin cuantizacion adicional.
- GPU de consumo: la variante NVFP4 es la unica viable en tarjetas de 24 GB, y aun asi requiere emulacion fuera de la serie RTX 50.
- Despliegue: ComfyUI con soporte PAN2 (fork del autor en github.com/speedyrulz/ComfyUI); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion.
- Conversion: Python 3.10+, torch 2.1 o superior (build CPU suficiente), safetensors, numpy y huggingface_hub; 16 GiB de RAM recomendados; unos diez minutos por transformer en CPU; `--device cuda` acelera pero puede no ser byte-identico.
- Disco: descarga de 63 GiB (transformer), 15 GiB (text encoder) y 2,7 GiB (VAE), mas los archivos de salida elegidos.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| PAN2-ComfyUI (este repo) | Conversion y cuantizacion de PAN2 | no disponible | no disponible | no disponible (sujeta a la de IFM/PAN2) | safetensors single-file |
| IFM/PAN2 original | Modelo de difusion | no disponible | no disponible | licencia propia de IFM | diffusers (~81 GiB) |
| Otras conversiones ComfyUI de modelos de difusion | Empaquetado single-file | variable | variable | segun el modelo base | safetensors |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo: es un conjunto de scripts de conversion; no aporta capacidades nuevas respecto a IFM/PAN2.
- Requiere una build de ComfyUI con soporte PAN2 (codigo del modelo, tipo de text encoder `pan2` y carga de VAEs en layout diffusers Wan); ComfyUI estandar no reconoce los archivos.
- La licencia no esta declarada en el repositorio; PAN2 se distribuye bajo licencia propia de IFM y el autor advierte de consultarla antes de redistribuir los archivos convertidos.
- La cuantizacion NVFP4 introduce un error relativo de pesos de aproximadamente 9% por capa, con riesgo de degradacion de calidad frente al original.
- La ejecucion con `--device cuda` puede producir resultados no byte-identicos a la conversion en CPU por diferencias de redondeo.
- El repositorio ocupa 104 GB y la conversion requiere descargar decenas de gigabytes y disponer de espacio adicional para las salidas.
- No hay informacion sobre sesgos, alucinacion, idiomas soportados ni limitaciones de contexto del modelo subyacente en la informacion disponible.
- Sin descargas ni likes registrados y sin pipeline declarado en Hugging Face; madurez y soporte de la comunidad no verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/speedyrulz/PAN2-ComfyUI
- Modelo original IFM/PAN2: https://huggingface.co/IFM/PAN2
- Fork de ComfyUI con soporte PAN2: https://github.com/speedyrulz/ComfyUI
