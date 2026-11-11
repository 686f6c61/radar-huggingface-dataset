# zhishuirgb1/sphla-sim2sim

## Resumen

SphLA sim2sim es un paquete de recursos para una demostración local de simulación text-to-motion sobre el robot humanoide G1 (Unitree) en MuJoCo. Lo publica el usuario zhishuirgb1 en Hugging Face y no es un modelo de lenguaje al uso, sino un conjunto de artefactos de inferencia: un modelo EMA de despliegue, un codificador y tokenizador de texto local (derivado de FLAN-T5), un actor congelado y los ficheros XML y mallas del robot. El repositorio ocupa 1,0 GB y contiene un único archivo comprimido de 972.284.074 bytes con hash SHA-256 verificable.

El problema que resuelve es acotado y práctico: permitir que un desarrollador reproduzca en su propia máquina una demo de control condicionado por texto, con el modelo y el simulador corriendo en local y una página de navegador que acepta instrucciones de texto sucesivas y muestra la ejecución. No hay inferencia alojada en Hugging Face; todo el cómputo ocurre en el equipo del usuario. El paquete se distribuye junto con un ZIP de código separado, con guías `RUN_MAC.md` y `RUN_LINUX.md`, y un script `download_assets.py --bundle-dir` para instalar y verificar los recursos.

La relevancia es la de un artefacto de investigación reproducible más que la de un modelo listo para producción. La propia model card advierte de que no se trata de un despliegue validado en robot real ni de una demostración de éxito en la tarea, y que la ejecución completa en Linux está pendiente de verificación (solo se han comprobado scripts y dependencias). La licencia es mixta y restrictiva en parte: los activos derivados de UFO mantienen Attribution-NonCommercial 4.0 International, mientras que los de FLAN-T5 conservan Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete incluye modelo EMA de despliegue, codificador/tokenizador de texto y actor congelado; no se detalla la topologia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | mixta: activos derivados de UFO bajo Attribution-NonCommercial 4.0 International; activos FLAN-T5 bajo Apache 2.0; procedencia del robot con avisos incluidos; sin licencia global declarada |
| Formato de pesos | no disponible (los recursos se empaquetan en `sphla-sim2sim-assets.zip`, 972.284.074 bytes, SHA-256 `737052365772275061ee11c1876e56d77a381d0dd2243e8024cbcea42c7dfd31`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. El paquete contiene un modelo EMA de despliegue, un codificador y tokenizador de texto local, un actor congelado y los ficheros XML y mallas del robot G1 para MuJoCo. La presencia de un modelo EMA de despliegue y un actor congelado es coherente con un pipeline de aprendizaje por refuerzo o imitación condicionado por texto, donde el actor ejecuta la política y el codificador de texto transforma las instrucciones en representaciones de condicionamiento. No se detalla la topología del actor ni del codificador más allá de su origen FLAN-T5.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El paquete excluye explícitamente el optimizador de entrenamiento y el estado de entrenamiento, por lo que no permite reanudar ni reproducir el proceso de entrenamiento, solo la inferencia. La innovación técnica declarada es la de un pipeline sim2sim: la política se ejecuta en simulación MuJoCo con el modelo del G1 y se controla mediante instrucciones de texto desde una interfaz local en el navegador.

## Capacidades

- Generación de movimiento condicionada por texto: el modelo traduce instrucciones en inglés a comportamiento motor del humanoide G1 dentro de la simulación.
- Ejecución en simulación MuJoCo con los ficheros XML y mallas del robot incluidos en el paquete.
- Interfaz local de texto: una página de navegador acepta instrucciones sucesivas mientras el lanzador mantiene el modelo y MuJoCo en ejecución.
- Codificación de texto local mediante un codificador y tokenizador derivados de FLAN-T5, sin dependencia de servicios externos.
- Verificación de integridad de los recursos mediante SHA-256 e instalación con `download_assets.py --bundle-dir`.
- Soporte de dos plataformas: paquetes de código separados para macOS y Linux.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de una demo de investigación: un equipo descarga el ZIP de recursos y el paquete de código de su plataforma, ejecuta `download_assets.py --bundle-dir` para verificar el SHA-256 y lanza la demo para observar control text-to-motion sobre el G1 en MuJoCo. Es adecuado porque el paquete está pensado exactamente para ese flujo documentado.
- Docencia y divulgación en robótica: la interfaz de navegador permite a estudiantes enviar instrucciones de texto y ver la ejecución del humanoide sin montar infraestructura de servidores ni GPUs en la nube.
- Evaluación de pipelines sim2sim: sirve como referencia para comprobar cómo se integra un actor congelado con un codificador de texto y un simulador físico antes de trasladar la política a un robot real.
- Pruebas de integración de dependencias en macOS y Linux: los scripts y la disponibilidad de dependencias están comprobados en ambas plataformas, lo que permite validar entornos antes de abordar proyectos mayores.
- Desarrollo de interfaces de instrucción por lenguaje natural para robótica: el patrón de página local más lanzador que mantiene simulador y modelo activos es reutilizable como base para prototipos de interacción.
- Auditoría de licencias de terceros: el paquete incluye `asset-notices/` y `THIRD_PARTY_NOTICES.md`, útil para equipos que necesitan revisar la procedencia y las restricciones de cada componente antes de reutilizarlo.
- No debe emplearse como base para un despliegue en robot real: la model card indica explícitamente que no constituye un despliegue validado ni demuestra éxito en la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El paquete pesa 1,0 GB en el repositorio y el ZIP de recursos 972.284.074 bytes, pero no se desglosa el tamaño de cada componente ni se indica memoria necesaria.
- GPU recomendadas: no disponible. No se especifica ningún modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Plataformas verificadas: macOS con ejecución comprobada en entorno limpio; Linux con scripts y dependencias comprobados, pero ejecución completa pendiente.
- Opciones de despliegue: lanzador local propio del paquete de código, con MuJoCo como simulador y una interfaz de navegador local. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de text-to-motion sobre humanoides en MuJoCo ni ofrece datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: es un paquete de recursos para una demo de control text-to-motion en simulación, y no debe evaluarse con métricas de LLM.
- Solo admite inglés como idioma de instrucción según los metadatos.
- No hay inferencia alojada: el repositorio no ofrece servicio de inferencia y todo el cómputo es local.
- La ejecución completa en Linux está pendiente de verificación; solo se han comprobado scripts y disponibilidad de dependencias.
- El paquete no incluye el optimizador ni el estado de entrenamiento, por lo que no permite reproducir el entrenamiento.
- No constituye un despliegue validado en robot real ni establece éxito en la tarea, según la propia model card.
- Licencia mixta y restrictiva en parte: los activos derivados de UFO mantienen Attribution-NonCommercial 4.0 International, lo que limita el uso comercial de esos componentes; los de FLAN-T5 conservan Apache 2.0. No se afirma ninguna licencia global ni derechos nuevos sobre material de terceros.
- Riesgo de alucinación y sesgos: no disponible, al no tratarse de un modelo generativo de texto y no documentarse comportamiento en ese sentido.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zhishuirgb1/sphla-sim2sim
- Web suplementaria con los paquetes de código para macOS y Linux: mencionada en la model card, sin URL explícita en la información disponible.
- Ficheros de avisos de licencia incluidos en el paquete: `asset-notices/` y `THIRD_PARTY_NOTICES.md` (referenciados, no enlazados).
- Guías de ejecución incluidas en el paquete de código: `RUN_MAC.md` y `RUN_LINUX.md` (referenciadas, no enlazadas).
