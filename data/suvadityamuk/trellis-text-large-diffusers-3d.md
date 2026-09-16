# suvadityamuk/TRELLIS-text-large-diffusers-3d

## Resumen

TRELLIS-text-large-diffusers-3d es una conversión del modelo de generación 3D texto-a-3D `microsoft/TRELLIS-text-large` al formato de la librería `diffusers` mediante el paquete `diffusers-3d`. Lo publica el usuario suvadityamuk y no está afiliado ni respaldado por Microsoft ni por OpenAI. Su función es permitir que el pipeline de TRELLIS se cargue y ejecute con la API estándar de `diffusers` (`AutoPipelineForTextTo3D`) sin depender del código original de Microsoft, manteniendo los valores de los pesos sin modificar.

El modelo genera representaciones 3D a partir de una descripción textual: campos de radiancia (Gaussian splats), mallas poligonales y exportaciones con materiales PBR. Internamente combina un acondicionador de texto basado en CLIP ViT-L/14 con dos modelos de flujo (flow matching) de tipo DiT que operan sobre latentes 3D: un Sparse Structure Flow Model que predice la estructura dispersa y un SLat Flow Model que predice el latente estructurado, seguidos de decodificadores específicos por formato de salida.

Es relevante porque reduce la fricción de integración: cualquier proyecto que ya use `diffusers` puede incorporar generación 3D texto-a-3D con las mismas convenciones de carga, tipos de dato y gestión de componentes. El repositorio ocupa 3,4 GB en fp16, no registra descargas ni likes, y no incluye resultados de benchmarks publicados, por lo que se trata de una conversión de formato orientada a la interoperabilidad, no de un modelo reentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching sobre latentes 3D con espinas DiT (Sparse Structure Flow Model y SLat Flow Model) mas decodificadores Swin de malla, gaussianas y campo de radiancia; acondicionador de texto CLIP ViT-L/14 |
| Parametros totales | no disponible. Estimacion indirecta: 3,4 GB en fp16 equivalen a unos 1.700 millones de parametros sumando todos los componentes (cifra estimada a partir del tamano del repositorio, no confirmada por el autor) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible. El unico texto de entrada pasa por el text tower de `openai/clip-vit-large-patch14`, cuya ventana estandar es de 77 tokens |
| Tipos de cuantizacion | pesos publicados en fp16. La pipeline admite carga en `bfloat16` o `float32` (`dtype=torch.bfloat16`). No se distribuyen GGUF, AWQ, GPTQ ni variantes int8/int4 |
| Idiomas soportados | no disponible. El codificador de texto CLIP esta entrenado predominantemente en ingles, por lo que las instrucciones en otros idiomas no estan garantizadas |
| Licencia | MIT. Pesos y arquitectura TRELLIS: Copyright (c) Microsoft Corporation. Pesos del encoder CLIP: MIT, Copyright (c) OpenAI |
| Formato de pesos | safetensors, organizados en carpetas por componente segun la convencion de `diffusers` |

## Arquitectura y entrenamiento

La informacion disponible no describe ningun entrenamiento propio: la conversión se realizó con la herramienta `diffusers-3d-convert-trellis` (versión `0.1.0.dev0`) sobre la revisión `442aa1e1afb9014e80681d3bf604e8d728a86ee7` de TRELLIS, y el autor indica explícitamente que los valores de los pesos no se han modificado respecto al modelo base. Por tanto, cualquier detalle de dataset, número de tokens o proceso de alineación (RLHF, DPO) corresponde al modelo original `microsoft/TRELLIS-text-large`, y no se detalla en la información proporcionada.

La arquitectura se organiza en siete componentes. El `conditioner` (`TrellisClipTextConditioner`) usa el text tower y el tokenizador de `openai/clip-vit-large-patch14` para convertir el prompt en embeddings. El `sparse_structure_flow_model` (`TrellisSparseStructureFlowModel`, checkpoint `ss_flow_txt_dit_L_16l8_fp16`) genera la estructura dispersa; su nomenclatura sugiere un DiT de escala L con 16 capas y parche 8, aunque esto es una lectura de los nombres de checkpoint y no está confirmado por el autor. El `slat_flow_model` (`TrellisSLatFlowModel`, `slat_flow_txt_dit_L_64l8p2_fp16`) produce el latente estructurado (SLat), presumiblemente con una espina de mayor profundidad. Los tres decodificadores de salida son `gaussian_decoder` (`slat_dec_gs_swin8_B_64l8gs32_fp16`), `mesh_decoder` (`slat_dec_mesh_swin8_B_64l8m256c_fp16`) y `radiance_field_decoder` (`slat_dec_rf_swin8_B_64l8r16_fp16`), todos con arquitectura Swin de escala B según su nomenclatura. El `sparse_structure_decoder` (`ss_dec_conv3d_16l8_fp16`) es convolucional 3D.

Un detalle técnico relevante es que la versión de texto comparte los decodificadores con la versión de imagen de TRELLIS: los checkpoints `ss_dec_conv3d_16l8_fp16`, `slat_dec_gs_swin8_B_64l8gs32_fp16`, `slat_dec_mesh_swin8_B_64l8m256c_fp16` y `slat_dec_rf_swin8_B_64l8r16_fp16` proceden de `TRELLIS-image-large` y se incluyen en el repositorio para que este pueda cargarse de forma autónoma. Todo el cálculo se ejecuta en PyTorch puro, en CPU o GPU; el renderizado de gaussianas requiere el backend opcional `gsplat`, y el mallado y la exportación PBR de TRELLIS.2 requieren el runtime compilado de O-Voxel.

## Capacidades

- Generacion de activos 3D a partir de texto en tres formatos de salida: Gaussian splats (`formats=("gaussian", ...)`), malla poligonal y campo de radiancia.
- Exportacion con materiales PBR mediante el runtime de O-Voxel (indicado para TRELLIS.2).
- Acondicionamiento por prompt de texto y por prompt negativo, mediante `TextCondition(text=..., negative_text=...)`.
- Muestreo configurable: los valores por defecto siguen el sampler de texto publicado, con guidance 7.5 sobre el intervalo 0,5-0,95.
- Ejecucion en CPU o GPU en precision `bfloat16` o `float32`, sin kernels CUDA obligatorios salvo para renderizado y mallado.
- Carga autonoma: todos los componentes necesarios estan dentro del repositorio, incluidos los decodificadores heredados de la version de imagen.
- Sin soporte de tool calling ni function calling: no es un modelo de lenguaje y no expone API de herramientas.
- Sin soporte de agentes ni razonamiento multi-paso: no hay bucle de decision ni planificacion.
- Sin capacidades conversacionales, de codigo, matematicas, vision, audio ni thinking mode.
- Sin capacidades multilingues garantizadas: el acondicionamiento depende del text tower de CLIP, orientado al ingles.

## Casos de uso

- Prototipado rapido de assets para videojuegos: a partir de una descripcion como "a wooden rocking chair" el pipeline devuelve malla y gaussianas, lo que permite validar siluetas y proporciones antes de encargar el modelado definitivo con artista.
- Catalogos de comercio electronico con vista 3D interactiva: generar gaussianas por articulo y renderizarlas en el navegador para que el cliente inspeccione el producto desde cualquier angulo, en lugar de depender de fotografias fijas.
- Previsualizacion de interiorismo y mobiliario: el modelo permite poblar una escena con variantes de un mismo objeto (por ejemplo, distintas sillas) cambiando el prompt, con la malla resultante importable en el motor de render del estudio.
- Generacion de props para escenarios de realidad aumentada: la salida de malla es el formato que consumen los pipelines de AR moviles, y la licencia MIT permite distribuir los activos generados sin restricciones de uso comercial.
- Investigacion en generacion 3D: al estar empaquetado como pipeline de `diffusers`, sirve como base reproducible para comparar estrategias de muestreo, guidance o prompting contra otros metodos, y para experimentar con el acondicionador de texto.
- Creacion de datasets sinteticos 3D: generar grandes volumenes de objetos etiquetados por prompt y renderizarlos como campos de radiancia para alimentar modelos de vision 3D o de reconstruccion.
- Integracion en herramientas de diseno grafico: al exponerse via `AutoPipelineForTextTo3D.from_pretrained`, un plugin de escritorio o web puede cargar el modelo una sola vez y ofrecer generacion de objetos dentro del propio editor.
- Demostraciones y docencia: el requisito de instalacion es unicamente el fork de `diffusers` y `diffusers-3d`, y el pipeline funciona en CPU, lo que facilita montar cuadernos de ejemplo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de calidad geométrica, CLIP score, FID, ni comparaciones cuantitativas con otros modelos texto-a-3D, y el modelo base tampoco se documenta con cifras en la información proporcionada. Tampoco se indican latencias ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia, los 3,4 GB de pesos en fp16 requieren al menos unos 4 GB solo para almacenar los parametros; sumando activaciones de los modelos de flujo (espinas DiT con decenas de capas) y buffers de decodificacion, una estimacion prudente es de 8 a 12 GB en `bfloat16` y de 16 GB o mas en `float32`.
- GPU recomendadas por gama: NVIDIA A100 o H100 para lotes grandes o uso en servidor; RTX 4090, RTX 4080 y RTX 3090 para uso profesional en estacion de trabajo; RTX 4070 Ti, RTX 4060 Ti de 16 GB y RTX 3060 de 12 GB como minimo practico en consumo.
- Compatibilidad con GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM en `bfloat16`. En GPUs de 8 GB o menos es probable que no quepa sin fragmentacion o descarga de modulos, y la informacion disponible no documenta ninguna estrategia de offload.
- Ejecucion en CPU: soportada explicitamente por `diffusers-3d` ("runs every network in plain PyTorch on CPU or GPU"), con tiempos de generacion no especificados.
- Opciones de despliegue: `diffusers` con el fork `suvadityamuk/diffusers` y el paquete `diffusers-3d`; backend `gsplat` opcional para renderizar gaussianas; runtime compilado de O-Voxel para mallado y exportacion PBR. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje ni distribuirse en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Contexto de texto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suvadityamuk/TRELLIS-text-large-diffusers-3d | Texto a 3D | no disponible (~1.700 M estimados por tamano del repo) | 77 tokens (CLIP ViT-L/14) | MIT | HuggingFace, requiere fork de `diffusers` y `diffusers-3d` |
| microsoft/TRELLIS-text-large | Texto a 3D | no disponible en la informacion proporcionada | 77 tokens (CLIP ViT-L/14) | MIT | HuggingFace, requiere el codigo original de TRELLIS |
| microsoft/TRELLIS-image-large | Imagen a 3D | no disponible en la informacion proporcionada | no aplica (entrada de imagen) | MIT | HuggingFace; sus decodificadores son los que reutiliza esta conversion |
| Otros modelos texto-a-3D (Shap-E, Hunyuan3D-2 y similares) | Texto a 3D | no disponible | no disponible | no disponible | no disponibles en la informacion proporcionada |

La diferencia comprobable entre las dos primeras filas es exclusivamente de empaquetado: los valores de los pesos son idénticos y la conversion anade la integracion con `diffusers`. La comparacion cuantitativa de rendimiento con alternativas de la misma categoria no puede realizarse con los datos disponibles.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad geometrica, fidelidad al prompt ni estabilidad de la malla, ni por parte del autor de la conversion ni en la informacion disponible.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existen informes de terceros sobre su funcionamiento real.
- Riesgo de alucinacion geometrica: como todo modelo generativo 3D, puede producir topologias incorrectas, geometria flotante, caras invertidas o mallas no estancas (no watertight) que fallen en pipelines de impresion 3D o de simulacion fisica.
- Fidelidad limitada al prompt: el acondicionamiento pasa exclusivamente por CLIP ViT-L/14, un codificador de 77 tokens orientado al ingles, por lo que prompts largos, muy detallados o en otros idiomas pueden degradar el resultado.
- Idiomas no declarados: la model card no especifica idiomas soportados y el encoder subyacente esta entrenado principalmente en ingles; no debe asumirse soporte multilingue.
- Dependencia de codigo no estandar: la carga requiere instalar un fork de `diffusers` desde GitHub en lugar del paquete oficial de PyPI, lo que complica la reproducibilidad, la fijacion de versiones y el mantenimiento en produccion.
- Dependencias opcionales con compilacion nativa: el renderizado de gaussianas necesita `gsplat` y el mallado o la exportacion PBR necesitan el runtime compilado de O-Voxel, lo que anade complejidad de instalacion y posibles problemas de compatibilidad de CUDA.
- Precision fp16: los pesos se publican en fp16, lo que puede introducir inestabilidad numerica en algunas GPUs; la pipeline permite forzar `bfloat16` o `float32` a cambio de mas memoria.
- Licencia MIT con atribucion: los pesos TRELLIS son Copyright (c) Microsoft Corporation y el encoder CLIP es Copyright (c) OpenAI; el uso comercial esta permitido, pero debe conservarse la atribucion correspondiente. El autor declara no estar afiliado ni respaldado por Microsoft ni por OpenAI.
- Repositorio de un unico autor y sin mantenimiento declarado: no se documentan politicas de actualizacion, soporte ni versionado mas alla de la revision indicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suvadityamuk/TRELLIS-text-large-diffusers-3d
- Modelo base: https://huggingface.co/microsoft/TRELLIS-text-large
- Fork de diffusers usado por la conversion: https://github.com/suvadityamuk/diffusers
- Paquete diffusers-3d (subdirectorio del fork): https://github.com/suvadityamuk/diffusers/tree/main/packages/diffusers-3d
- Codificador de texto: https://huggingface.co/openai/clip-vit-large-patch14

Nota sobre la busqueda web: los resultados devueltos no contienen informacion relevante sobre este modelo (corresponden a paginas generales de YouTube), por lo que no se han podido incorporar papers, blogs ni demos adicionales.
