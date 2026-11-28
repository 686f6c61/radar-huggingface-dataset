# zkwr1081/PinkCherry-MiniMax-H3-Reference

## Resumen

PinkCherry MiniMax H3 — Reference Mirror es un repositorio de referencia publicado por el usuario zkwr1081 en Hugging Face. No contiene pesos del modelo: es un espejo de metadatos y flujos de trabajo (workflows) que apunta al repositorio original `SexGod1979/PinkCherry-NSFW_MiniMax-H3`, en la revisión `08ac92dbd56a8523beea55aafaaba1a1d72c45cb`. El pipeline declarado es text-to-video y la librería asociada es transformers.

El modelo subyacente pertenece a la familia MiniMax H3, un sistema de generación de vídeo a partir de texto. El repositorio incluye únicamente el `README.md` heredado del autor original, el `config.json` y tres ficheros de configuración de flujos: un workflow de ComfyUI para la variante 1.8 hybrid, una configuración Wan2GP para alpha-0.1-fl2va y un workflow ComfyUI para v1.5-fl2va con Turbo.

La relevancia de este repositorio es documental, no práctica: permite inspeccionar la estructura de configuración y los flujos de trabajo del modelo original sin descargar los aproximadamente 699,77 GB que ocupa el repositorio completo (con 20 ficheros de más de 1 GB). El propio autor advierte de que no se ha desplegado ningún endpoint de inferencia y de que se requiere infraestructura MiniMax H3/ComfyUI con memoria de GPU sustancial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia MiniMax H3, pipeline text-to-video) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no incluidos en este espejo; el repositorio upstream contiene aproximadamente 699,77 GB de pesos (20 ficheros de mas de 1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo MiniMax H3 en la documentacion proporcionada. El pipeline declarado es text-to-video y la libreria es transformers, lo que sugiere un modelo de difusion o de generacion condicionada por texto orientado a la sintesis de video, pero no se detalla si emplea un transformer de difusion, un modelo híbrido ni el tipo de encoder de texto.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de ajuste. El repositorio espejo unicamente preserva la atribucion, la revision upstream y los flujos de trabajo, sin informacion sobre el proceso de entrenamiento.

## Capacidades

- Generacion de video a partir de texto (text-to-video), segun el pipeline declarado.
- Soporte de flujos de trabajo en ComfyUI para las variantes 1.8 hybrid y v1.5-fl2va.
- Soporte de configuracion Wan2GP para la variante alpha-0.1-fl2va.
- Variante Turbo disponible en el workflow v1.5 (MiniMaxH3_PinkCherryV15_Fla2va_wTurbo).
- Contenido marcado como `not-for-all-audiences` por el autor original.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue.

## Casos de uso

- Inspeccion de configuracion del modelo: descargar `config.json` para revisar los parametros declarados del modelo MiniMax H3 sin asumir el coste de almacenamiento de los pesos completos.
- Reutilizacion de workflows en ComfyUI: importar los ficheros JSON de las variantes 1.8 hybrid y v1.5-fl2va en una instalacion de ComfyUI compatible con MiniMax H3 para reproducir el pipeline del autor original.
- Integracion en Wan2GP: emplear `alpha-0.1-fl2va/wan2gp.json` como punto de partida para configurar la generacion en el entorno Wan2GP.
- Prototipado de generacion de video: usar la variante Turbo del workflow v1.5 para iterar con un numero reducido de pasos de muestreo, segun la nomenclatura del fichero.
- Auditoria de licencia y atribucion: consultar el espejo para verificar la revision upstream y la licencia Apache-2.0 antes de redistribuir o desplegar el modelo original.
- Documentacion de infraestructura: utilizar el aviso de requisitos de hardware del repositorio para dimensionar la memoria de GPU necesaria antes de descargar los aproximadamente 699,77 GB del upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numerica; el autor indica que los workflows requieren infraestructura MiniMax H3/ComfyUI compatible y "memoria de GPU sustancial".
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el autor afirma explicitamente que un POCO C65 (telefono movil) no puede ejecutar el modelo completo localmente; no se confirma compatibilidad con GPUs de consumo como RTX 4090.
- Opciones de despliegue: ComfyUI y Wan2GP, segun los flujos incluidos. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio upstream ocupa aproximadamente 699,77 GB, con 20 ficheros de mas de 1 GB.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de text-to-video que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es un espejo de metadatos y workflows; no es ejecutable por si mismo.
- El modelo original esta marcado como `not-for-all-audiences`, lo que implica contenido para adultos y posibles restricciones de uso en entornos profesionales o publicos.
- La licencia Apache-2.0 la declara el autor upstream; el espejo no otorga derechos adicionales y recomienda revisar el LICENSE/NOTICE original antes de redistribuir o usar comercialmente.
- No se dispone de informacion sobre sesgos, tasa de alucinacion ni limitaciones de contexto o idioma.
- No hay endpoint de inferencia desplegado por este repositorio.
- Los requisitos de almacenamiento (aproximadamente 699,77 GB) y de memoria de GPU son elevados y no aptos para hardware de consumo convencional.
- La fecha de creacion del repositorio (2026-11-28) y la escasa actividad (0 descargas, 0 likes) sugieren un proyecto sin validacion comunitaria.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/zkwr1081/PinkCherry-MiniMax-H3-Reference
- Repositorio upstream: https://huggingface.co/SexGod1979/PinkCherry-NSFW_MiniMax-H3
- Revision upstream: `08ac92dbd56a8523beea55aafaaba1a1d72c45cb`
